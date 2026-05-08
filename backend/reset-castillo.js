const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetCastillo() {
  console.log('🔄 Resetting Castillo user...');
  
  const email = 'castillo.dalia76@yahoo.com';
  
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (user) {
      console.log(`✅ Found user: ${user.name}`);
      
      // Delete all transactions
      await prisma.transaction.deleteMany({
        where: { fromUserId: user.id }
      });
      console.log('🗑️ Deleted all existing transactions');
      
      // Delete the user
      await prisma.user.delete({
        where: { email }
      });
      console.log('🗑️ Deleted user');
    }
    
    // Create fresh user
    const hashedPassword = await bcrypt.hash('Castillo$94', 10);
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: 'Dalia Castillo',
        walletAddress: `0x${Math.random().toString(36).substring(2, 15)}`,
        balance: JSON.stringify({ BTC: 0, ETH: 0, USDT: 31386 }),
        isActive: true
      }
    });
    console.log('✅ Created fresh user');
    
    // All unique transaction amounts (no duplicates)
    const amounts = [
      150, 3600, 1530, 650, 750, 273, 500, 15, 200, 250, 20, 10,
      3000, 2000, 1000, 200, 25, 50, 400, 80,
      2000, 1000, 500, 200, 100, 450, 125, 132, 962, 700, 5000, 800, 31,
      50, 20, 13, 27, 82, 95, 34, 80, 26, 31
    ];
    
    // Add all transactions
    for (let i = 0; i < amounts.length; i++) {
      await prisma.transaction.create({
        data: {
          fromUserId: newUser.id,
          fromAddress: newUser.walletAddress,
          toAddress: newUser.walletAddress,
          amount: amounts[i],
          currency: 'USDT',
          status: 'CONFIRMED',
          type: 'RECEIVE',
          txHash: `Deposit_${amounts[i]}_USDT_${Date.now()}_${i}`,
          createdAt: new Date()
        }
      });
    }
    
    console.log(`✅ Added ${amounts.length} unique transactions`);
    console.log(`💰 Balance: $31,386 USDT`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Castillo user reset complete!');
    console.log('Email: castillo.dalia76@yahoo.com');
    console.log('Password: Castillo$94');
    console.log('Balance: $31,386 USDT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetCastillo();