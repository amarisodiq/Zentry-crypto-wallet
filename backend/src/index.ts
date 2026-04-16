import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Validation Schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const sendTransactionSchema = z.object({
  toAddress: z.string().min(10),
  amount: z.number().positive(),
  currency: z.enum(['BTC', 'ETH', 'USDT'])
});

// Middleware
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Account suspended' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = async (req: any, res: any, next: any) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error.errors[0].message });
  
  const { email, password, name } = validation.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const walletAddress = `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, walletAddress }
    });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!);
    res.json({ token, user: { id: user.id, email, name, role: user.role, walletAddress, balance: user.balance } });
  } catch {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error.errors[0].message });
  
  const { email, password } = validation.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, walletAddress: user.walletAddress, balance: user.balance, isActive: user.isActive } });
});

// Transaction Routes
app.post('/api/transactions/send', authenticate, async (req: any, res) => {
  const validation = sendTransactionSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error.errors[0].message });
  
  const { toAddress, amount, currency } = validation.data;
  const balance = req.user.balance as any;
  
  if (balance[currency] < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  const txHash = `0x${Date.now()}${Math.random().toString(36).substring(2, 10)}`;
  const transaction = await prisma.transaction.create({
    data: {
      fromUserId: req.user.id,
      fromAddress: req.user.walletAddress,
      toAddress,
      amount,
      currency,
      status: 'PENDING',
      type: 'SEND',
      txHash
    }
  });
  
  res.json(transaction);
});

app.get('/api/transactions', authenticate, async (req: any, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { fromUserId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json(transactions);
});

// Admin Routes
app.get('/api/admin/stats', authenticate, requireAdmin, async (req, res) => {
  const [totalUsers, totalTransactions, pendingTransactions] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: 'PENDING' } })
  ]);
  res.json({ totalUsers, totalTransactions, pendingTransactions });
});

app.get('/api/admin/users', authenticate, requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, balance: true, walletAddress: true }
  });
  res.json(users);
});

app.put('/api/admin/users/:id/toggle-status', authenticate, requireAdmin, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: !user.isActive }
  });
  
  await prisma.auditLog.create({
    data: {
      adminId: req.user.id,
      action: 'TOGGLE_USER_STATUS',
      targetId: req.params.id,
      details: JSON.stringify({ newStatus: updated.isActive, previousStatus: user.isActive })
    }
  });
  
  res.json(updated);
});

app.get('/api/admin/transactions/pending', authenticate, requireAdmin, async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' }
  });
  res.json(transactions);
});

app.put('/api/admin/transactions/:id/confirm', authenticate, requireAdmin, async (req: any, res) => {
  const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });
  if (!transaction || transaction.status !== 'PENDING') {
    return res.status(400).json({ error: 'Transaction cannot be confirmed' });
  }
  
  const fromUser = await prisma.user.findUnique({ where: { id: transaction.fromUserId } });
  const balance = fromUser?.balance as any;
  balance[transaction.currency] -= transaction.amount;
  
  await prisma.user.update({
    where: { id: transaction.fromUserId },
    data: { balance }
  });
  
  const updated = await prisma.transaction.update({
    where: { id: req.params.id },
    data: { status: 'CONFIRMED' }
  });
  
  await prisma.auditLog.create({
    data: {
      adminId: req.user.id,
      action: 'CONFIRM_TRANSACTION',
      targetId: req.params.id,
      details: JSON.stringify({ txHash: transaction.txHash, amount: transaction.amount, currency: transaction.currency })
    }
  });
  
  res.json(updated);
});

app.put('/api/admin/transactions/:id/reject', authenticate, requireAdmin, async (req: any, res) => {
  const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });
  if (!transaction || transaction.status !== 'PENDING') {
    return res.status(400).json({ error: 'Transaction cannot be rejected' });
  }
  
  const updated = await prisma.transaction.update({
    where: { id: req.params.id },
    data: { status: 'FAILED' }
  });
  
  await prisma.auditLog.create({
    data: {
      adminId: req.user.id,
      action: 'REJECT_TRANSACTION',
      targetId: req.params.id,
      details: JSON.stringify({ txHash: transaction.txHash })
    }
  });
  
  res.json(updated);
});

app.get('/api/admin/audit-logs', authenticate, requireAdmin, async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    include: { admin: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  res.json(logs);
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));