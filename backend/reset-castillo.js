const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetCastillo() {
  console.log('🔄 Updating Castillo user with new transactions...');
  
  const email = 'castillo.dalia76@yahoo.com';
  const existingBalance = 40892.38;
  const newDepositTotal = 10000;
  const additionalAmount = 1200;  // Additional $1,200
  const finalTotalBalance = existingBalance + newDepositTotal + additionalAmount; // 40892.38 + 10000 + 1200 = 52092.38
  
  try {
    // Find Castillo user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ Castillo user not found!');
      return;
    }
    
    console.log(`✅ Found Castillo user: ${user.name}`);
    console.log(`💰 Current balance: $${existingBalance.toFixed(2)} USDT`);
    console.log(`📊 Adding $${newDepositTotal.toFixed(2)} USDT in random transactions today`);
    console.log(`📊 Plus additional $${additionalAmount.toFixed(2)} USDT`);
    console.log(`🎯 Target balance: $${finalTotalBalance.toFixed(2)} USDT`);
    
    // Generate random transactions that sum to $10,000
    const amounts = [];
    let remaining = newDepositTotal;
    
    // Create random transactions (minimum $100 each)
    while (remaining > 0) {
      let randomAmount;
      
      if (remaining > 2500) {
        randomAmount = Math.floor(Math.random() * 2400) + 100;
      } else if (remaining > 500) {
        randomAmount = Math.floor(Math.random() * (remaining - 100)) + 100;
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
    
    // Add the additional $1,200 as a separate transaction
    amounts.push(additionalAmount);
    
    console.log(`\n📊 Generated ${amounts.length} random transactions for today:`);
    amounts.forEach((amount, i) => {
      console.log(`   ${i + 1}. $${amount.toFixed(2)} USDT`);
    });
    console.log(`   ────────────────────────────`);
    console.log(`   TOTAL: $${amounts.reduce((a, b) => a + b, 0).toFixed(2)} USDT`);
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Add each transaction with different times throughout the day
    for (let i = 0; i < amounts.length; i++) {
      // Spread transactions throughout the day (9 AM to 9 PM)
      const hour = 9 + Math.floor(Math.random() * 12);
      const minute = Math.floor(Math.random() * 60);
      
      await prisma.transaction.create({
        data: {
          fromUserId: user.id,
          fromAddress: user.walletAddress,
          toAddress: user.walletAddress,
          amount: amounts[i],
          currency: 'USDT',
          status: 'CONFIRMED',
          type: 'RECEIVE',
          txHash: `Today_Deposit_${amounts[i]}_USDT_${Date.now()}_${i}`,
          createdAt: new Date(`${todayStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00Z`),
        },
      });
    }
    
    // Update user's balance to final total
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        balance: JSON.stringify({ BTC: 0, ETH: 0, USDT: finalTotalBalance })
      }
    });
    
    console.log(`\n✅ Added ${amounts.length} new transactions for Castillo`);
    console.log(`💰 New balance: $${finalTotalBalance.toFixed(2)} USDT`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Castillo user updated successfully!');
    console.log('Email: castillo.dalia76@yahoo.com');
    console.log('Password: Castillo$94');
    console.log(`Old Balance: $${existingBalance.toFixed(2)} USDT`);
    console.log(`New Deposits: $${(newDepositTotal + additionalAmount).toFixed(2)} USDT`);
    console.log(`New Balance: $${finalTotalBalance.toFixed(2)} USDT`);
    console.log(`New Transactions: ${amounts.length} (all today)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetCastillo();