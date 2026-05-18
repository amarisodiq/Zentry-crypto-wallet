const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBalance() {
  const email = 'castillo.dalia76@yahoo.com';
  
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  // Current balance from your screenshot is $51,482.70
  // Target balance is $53,282.70
  // Need to add $1,800
  const amountToAdd = 1800;
  
  // Get current balance
  let balance = JSON.parse(user.balance);
  const oldBalance = balance.USDT;
  balance.USDT = 53282.70;
  
  // Update balance
  await prisma.user.update({
    where: { id: user.id },
    data: { balance: JSON.stringify(balance) }
  });
  
  // Add a transaction for the missing amount
  await prisma.transaction.create({
    data: {
      fromUserId: user.id,
      fromAddress: user.walletAddress,
      toAddress: user.walletAddress,
      amount: amountToAdd,
      currency: "USDT",
      status: "CONFIRMED",
      type: "RECEIVE",
      txHash: `Balance_Correction_${amountToAdd}_USDT_${Date.now()}`,
      createdAt: new Date()
    }
  });
  
  console.log(`✅ Balance fixed: $${oldBalance} → $${balance.USDT}`);
  console.log(`✅ Added $${amountToAdd} correction transaction`);
}

fixBalance();