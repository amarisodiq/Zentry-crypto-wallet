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
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// Helper function to auto-seed database on startup
async function ensureDatabaseHasUsers() {
  try {
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('📦 No users found. Seeding database...');
      
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@zentry.com',
          password: adminPassword,
          name: 'Admin User',
          role: 'ADMIN',
          walletAddress: '0xadmin123456789',
          balance: JSON.stringify({ BTC: 10, ETH: 100, USDT: 50000 }),
          isActive: true
        }
      });
      console.log('✅ Admin user created');
      
      // Create test user 1
      const user1Password = await bcrypt.hash('user123', 10);
      await prisma.user.create({
        data: {
          email: 'user1@zentry.com',
          password: user1Password,
          name: 'Test User 1',
          walletAddress: '0xuser1abcdef123',
          balance: JSON.stringify({ BTC: 1.5, ETH: 5.2, USDT: 2500 }),
          isActive: true
        }
      });
      console.log('✅ Test user 1 created');
      
      // Create test user 2
      const user2Password = await bcrypt.hash('user123', 10);
      await prisma.user.create({
        data: {
          email: 'user2@zentry.com',
          password: user2Password,
          name: 'Test User 2',
          walletAddress: '0xuser2abcdef456',
          balance: JSON.stringify({ BTC: 0.8, ETH: 3.1, USDT: 1500 }),
          isActive: true
        }
      });
      console.log('✅ Test user 2 created');
      
      console.log('\n🎉 Database seeded successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Login with:');
      console.log('  Admin: admin@zentry.com / admin123');
      console.log('  User:  user1@zentry.com / user123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log(`✅ Database already has ${userCount} users`);
    }
  } catch (error) {
    console.error('❌ Error checking/seeding database:', error);
  }
}

// Middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://zentry-crypto-wallet-cugi.vercel.app',
  'https://zentry-crypto-wallet.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked origin:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rate limiting
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

// Authentication Middleware
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - User not found' });
    }
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account suspended' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = async (req: any, res: any, next: any) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors[0].message });
  }
  
  const { email, password, name } = validation.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const walletAddress = `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, walletAddress }
    });
    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email, 
        name, 
        role: user.role, 
        walletAddress, 
        balance: user.balance 
      } 
    });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login attempt:', req.body.email);
  
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors[0].message });
  }
  
  const { email, password } = validation.data;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('✅ Login successful:', email);
    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role, 
        walletAddress: user.walletAddress, 
        balance: user.balance, 
        isActive: user.isActive 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== TRANSACTION ROUTES ====================

app.post('/api/transactions/send', authenticate, async (req: any, res) => {
  const validation = sendTransactionSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors[0].message });
  }
  
  const { toAddress, amount, currency } = validation.data;
  
  const balance = typeof req.user.balance === 'string' 
    ? JSON.parse(req.user.balance) 
    : req.user.balance;
  
  if (!balance[currency] || balance[currency] < amount) {
    return res.status(400).json({ error: `Insufficient ${currency} balance` });
  }
  
  balance[currency] -= amount;
  
  await prisma.user.update({
    where: { id: req.user.id },
    data: { balance: JSON.stringify(balance) }
  });
  
  const txHash = `0x${Date.now()}${Math.random().toString(36).substring(2, 10)}`;
  const transaction = await prisma.transaction.create({
    data: {
      fromUserId: req.user.id,
      fromAddress: req.user.walletAddress,
      toAddress,
      amount,
      currency,
      status: 'CONFIRMED',
      type: 'SEND',
      txHash
    }
  });
  
  res.json({ 
    transaction, 
    newBalance: balance,
    message: `Successfully sent ${amount} ${currency} to ${toAddress}`
  });
});

app.get('/api/transactions', authenticate, async (req: any, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { fromUserId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json(transactions);
});

// ==================== ADMIN ROUTES ====================

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
    select: { 
      id: true, 
      email: true, 
      name: true, 
      role: true, 
      isActive: true, 
      createdAt: true, 
      balance: true, 
      walletAddress: true 
    }
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

app.put('/api/admin/users/:id/role', authenticate, requireAdmin, async (req: any, res) => {
  const { role } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { role }
  });
  res.json(updated);
});

app.put('/api/admin/users/:id/balance', authenticate, requireAdmin, async (req: any, res) => {
  const { balance } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { balance: JSON.stringify(balance) }
  });
  res.json(updated);
});

app.delete('/api/admin/users/:id', authenticate, requireAdmin, async (req: any, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
});

app.get('/api/admin/transactions/pending', authenticate, requireAdmin, async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' }
  });
  res.json(transactions);
});

app.get('/api/admin/transactions/all', authenticate, requireAdmin, async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    include: { fromUser: { select: { name: true, email: true } } },
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
  const balance = typeof fromUser?.balance === 'string' 
    ? JSON.parse(fromUser.balance) 
    : fromUser?.balance;
  balance[transaction.currency] -= transaction.amount;
  
  await prisma.user.update({
    where: { id: transaction.fromUserId },
    data: { balance: JSON.stringify(balance) }
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

app.put('/api/admin/transactions/:id/edit', authenticate, requireAdmin, async (req: any, res) => {
  const { amount } = req.body;
  const updated = await prisma.transaction.update({
    where: { id: req.params.id },
    data: { amount }
  });
  res.json(updated);
});

app.delete('/api/admin/transactions/:id', authenticate, requireAdmin, async (req: any, res) => {
  await prisma.transaction.delete({ where: { id: req.params.id } });
  res.json({ message: 'Transaction deleted' });
});

app.get('/api/admin/audit-logs', authenticate, requireAdmin, async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    include: { admin: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  res.json(logs);
});

// ==================== UTILITY ENDPOINTS ====================

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Zentry API is running', 
    version: '1.0.0',
    status: 'healthy'
  });
});

app.post('/api/seed', async (req, res) => {
  try {
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@zentry.com' }
    });
    
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@zentry.com',
          password: adminPassword,
          name: 'Admin User',
          role: 'ADMIN',
          walletAddress: '0xadmin123456789',
          balance: JSON.stringify({ BTC: 10, ETH: 100, USDT: 50000 }),
          isActive: true
        }
      });
    }
    
    res.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// ==================== START SERVER ====================

async function startServer() {
  await ensureDatabaseHasUsers();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 API base: http://localhost:${PORT}/api`);
  });
}

startServer().catch(console.error);