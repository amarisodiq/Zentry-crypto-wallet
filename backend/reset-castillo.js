const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetCastillo() {
  console.log('🔄 Updating Castillo user with new transactions...');
  
  const email = 'castillo.dalia76@yahoo.com';
  const existingBalance = 40892.38;
  const newDepositTotal = 10000;
  const additionalAmount = 1800;  // Additional $1,800 made of $60+ transactions
  const finalTotalBalance = existingBalance + newDepositTotal + additionalAmount; // 52692.38
  
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
    console.log(`📊 Plus additional $${additionalAmount.toFixed(2)} USDT (in $60+ increments)`);
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
    
    // Generate transactions for the additional $1,800 (each $60 or more)
    const additionalAmounts = [];
    let additionalRemaining = additionalAmount;
    
    while (additionalRemaining > 0) {
      let randomAmount;
      
      if (additionalRemaining > 500) {
        // Random between 60 and 500
        randomAmount = Math.floor(Math.random() * 440) + 60;
      } else if (additionalRemaining > 60) {
        // Random between 60 and remaining
        randomAmount = Math.floor(Math.random() * (additionalRemaining - 60)) + 60;
      } else {
        // Last transaction (will be at least 60, or whatever remains)
        randomAmount = additionalRemaining;
      }
      
      randomAmount = Math.round(randomAmount * 100) / 100;
      
      if (randomAmount > additionalRemaining) {
        randomAmount = additionalRemaining;
      }
      
      // Ensure minimum $60
      if (randomAmount < 60 && additionalRemaining > 60) {
        randomAmount = 60;
      }
      
      additionalAmounts.push(randomAmount);
      additionalRemaining -= randomAmount;
      additionalRemaining = Math.round(additionalRemaining * 100) / 100;
    }
    
    // Combine all amounts
    const allAmounts = [...amounts, ...additionalAmounts];
    
    console.log(`\n📊 Generated ${amounts.length} random transactions for $10,000:`);
    amounts.forEach((amount, i) => {
      console.log(`   ${i + 1}. $${amount.toFixed(2)} USDT`);
    });
    
    console.log(`\n📊 Generated ${additionalAmounts.length} transactions for $1,800 (each $60+):`);
    additionalAmounts.forEach((amount, i) => {
      console.log(`   ${amounts.length + i + 1}. $${amount.toFixed(2)} USDT`);
    });
    
    console.log(`   ────────────────────────────`);
    console.log(`   TOTAL: $${allAmounts.reduce((a, b) => a + b, 0).toFixed(2)} USDT`);
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Add each transaction with different times throughout the day
    for (let i = 0; i < allAmounts.length; i++) {
      // Spread transactions throughout the day (8 AM to 10 PM)
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
          txHash: `Today_Deposit_${allAmounts[i]}_USDT_${Date.now()}_${i}`,
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
    
    console.log(`\n✅ Added ${allAmounts.length} new transactions for Castillo`);
    console.log(`💰 New balance: $${finalTotalBalance.toFixed(2)} USDT`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Castillo user updated successfully!');
    console.log('Email: castillo.dalia76@yahoo.com');
    console.log('Password: Castillo$94');
    console.log(`Old Balance: $${existingBalance.toFixed(2)} USDT`);
    console.log(`New Deposits: $${(newDepositTotal + additionalAmount).toFixed(2)} USDT`);
    console.log(`New Balance: $${finalTotalBalance.toFixed(2)} USDT`);
    console.log(`New Transactions: ${allAmounts.length} (all today, each $60+ for the $1,800 portion)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetCastillo();