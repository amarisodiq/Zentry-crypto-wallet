const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetCastillo() {
  console.log('🔄 Updating Castillo user with new transactions...');
  
  const email = 'castillo.dalia76@yahoo.com';
  const existingBalance = 40892.38;
  const newDepositTotal = 10000;
  const additionalAmount = 1800;
  const finalTotalBalance = existingBalance + newDepositTotal + additionalAmount;
  
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ Castillo user not found!');
      return;
    }
    
    console.log(`✅ Found Castillo user: ${user.name}`);
    console.log(`💰 Current balance: $${existingBalance.toFixed(2)} USDT`);
    
    // Generate transactions for $10,000 (each between $50 and $300)
    const amounts = [];
    let remaining = newDepositTotal;
    
    while (remaining > 0) {
      let randomAmount;
      
      if (remaining > 300) {
        randomAmount = Math.floor(Math.random() * 250) + 50; // 50-300
      } else if (remaining > 50) {
        randomAmount = Math.floor(Math.random() * (remaining - 50)) + 50;
      } else {
        randomAmount = remaining;
      }
      
      randomAmount = Math.round(randomAmount * 100) / 100;
      
      if (randomAmount > remaining) {
        randomAmount = remaining;
      }
      
      amounts.push(randomAmount);
      remaining -= randomAmount;
      remaining = Math.round(remaining * 100) / 100;
    }
    
    // Generate transactions for $1,800 (each between $60 and $150)
    const additionalAmounts = [];
    let additionalRemaining = additionalAmount;
    
    while (additionalRemaining > 0) {
      let randomAmount;
      
      if (additionalRemaining > 150) {
        randomAmount = Math.floor(Math.random() * 90) + 60; // 60-150
      } else if (additionalRemaining > 60) {
        randomAmount = Math.floor(Math.random() * (additionalRemaining - 60)) + 60;
      } else {
        randomAmount = additionalRemaining;
      }
      
      randomAmount = Math.round(randomAmount * 100) / 100;
      
      if (randomAmount > additionalRemaining) {
        randomAmount = additionalRemaining;
      }
      
      additionalAmounts.push(randomAmount);
      additionalRemaining -= randomAmount;
      additionalRemaining = Math.round(additionalRemaining * 100) / 100;
    }
    
    const allAmounts = [...amounts, ...additionalAmounts];
    
    console.log(`\n📊 Generated ${amounts.length} transactions for $10,000 ($${newDepositTotal}):`);
    console.log(`   Range: $50 - $300 each`);
    console.log(`\n📊 Generated ${additionalAmounts.length} transactions for $1,800 ($${additionalAmount}):`);
    console.log(`   Range: $60 - $150 each`);
    console.log(`\n   TOTAL: $${allAmounts.reduce((a, b) => a + b, 0).toFixed(2)} USDT`);
    
    // Delete existing today's transactions (optional - to avoid duplicates)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const startOfDay = new Date(`${todayStr}T00:00:00Z`);
    const endOfDay = new Date(`${todayStr}T23:59:59Z`);
    
    await prisma.transaction.deleteMany({
      where: {
        fromUserId: user.id,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
    console.log(`\n🗑️ Deleted existing transactions from today`);
    
    // Add new transactions with different times
    for (let i = 0; i < allAmounts.length; i++) {
      const hour = 8 + Math.floor(Math.random() * 14);
      const minute = Math.floor(Math.random() * 60);
      
      await prisma.transaction.create({
        data: {
          fromUserId: user.id,
          fromAddress: user.walletAddress,
          toAddress: user.walletAddress,
          amount: allAmounts[i],
          currency: 'USDT',
          status: 'CONFIRMED',
          type: 'RECEIVE',
          txHash: `Deposit_${allAmounts[i]}_USDT_${Date.now()}_${i}`,
          createdAt: new Date(`${todayStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00Z`),
        },
      });
    }
    
    // Update user's balance
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        balance: JSON.stringify({ BTC: 0, ETH: 0, USDT: finalTotalBalance })
      }
    });
    
    console.log(`\n✅ Added ${allAmounts.length} new transactions for Castillo`);
    console.log(`💰 New balance: $${finalTotalBalance.toFixed(2)} USDT`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Castillo user updated successfully!');
    console.log(`New Balance: $${finalTotalBalance.toFixed(2)} USDT`);
    console.log(`Total New Transactions: ${allAmounts.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetCastillo();