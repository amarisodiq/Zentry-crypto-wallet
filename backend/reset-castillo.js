const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetCastillo() {
  console.log('🔄 Updating Castillo user with new transactions...');
  
  const email = 'castillo.dalia76@yahoo.com';
  const existingBalance = 40892.38;
  const newDepositTotal = 10000;
  const additionalAmount = 1800;  // Additional $1,800
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
    console.log(`📊 Plus additional $${additionalAmount.toFixed(2)} USDT (in $60-$300 increments)`);
    console.log(`🎯 Target balance: $${finalTotalBalance.toFixed(2)} USDT`);
    
    // Generate random transactions that sum to $10,000 (between $100-$1000)
    const amounts = [];
    let remaining = newDepositTotal;
    
    while (remaining > 0) {
      let randomAmount;
      
      if (remaining > 1000) {
        randomAmount = Math.floor(Math.random() * 900) + 100; // 100-1000
      } else if (remaining > 100) {
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
    
    // Generate smaller transactions for the additional $1,800 (each $60-$300)
    const additionalAmounts = [];
    let additionalRemaining = additionalAmount;
    
    while (additionalRemaining > 0) {
      let randomAmount;
      
      if (additionalRemaining > 300) {
        // Random between 60 and 300
        randomAmount = Math.floor(Math.random() * 240) + 60;
      } else if (additionalRemaining > 60) {
        // Random between 60 and remaining
        randomAmount = Math.floor(Math.random() * (additionalRemaining - 60)) + 60;
      } else {
        randomAmount = additionalRemaining;
      }
      
      randomAmount = Math.round(randomAmount * 100) / 100;
      
      if (randomAmount > additionalRemaining) {
        randomAmount = additionalRemaining;
      }
      
      // Ensure minimum $60 and maximum $300
      if (randomAmount < 60 && additionalRemaining > 60) {
        randomAmount = 60;
      }
      if (randomAmount > 300) {
        randomAmount = 300;
      }
      
      additionalAmounts.push(randomAmount);
      additionalRemaining -= randomAmount;
      additionalRemaining = Math.round(additionalRemaining * 100) / 100;
    }
    
    // Combine all amounts
    const allAmounts = [...amounts, ...additionalAmounts];
    
    console.log(`\n📊 Generated ${amounts.length} transactions for $10,000:`);
    amounts.slice(0, 5).forEach((amount, i) => {
      console.log(`   ${i + 1}. $${amount.toFixed(2)} USDT`);
    });
    if (amounts.length > 5) console.log(`   ... and ${amounts.length - 5} more`);
    
    console.log(`\n📊 Generated ${additionalAmounts.length} transactions for $1,800 (each $60-$300):`);
    additionalAmounts.forEach((amount, i) => {
      console.log(`   ${amounts.length + i + 1}. $${amount.toFixed(2)} USDT`);
    });
    
    console.log(`\n   ────────────────────────────`);
    console.log(`   GRAND TOTAL: $${allAmounts.reduce((a, b) => a + b, 0).toFixed(2)} USDT`);
    
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
    console.log(`New Transactions: ${allAmounts.length} (all today)`);
    console.log(`   - $10,000 portion: ${amounts.length} transactions ($${newDepositTotal.toFixed(2)})`);
    console.log(`   - $1,800 portion: ${additionalAmounts.length} transactions ($${additionalAmount.toFixed(2)})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetCastillo();