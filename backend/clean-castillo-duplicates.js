const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDuplicates() {
  console.log('🧹 Cleaning Castillo duplicate transactions...');
  
  const user = await prisma.user.findUnique({
    where: { email: 'castillo.dalia76@yahoo.com' }
  });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log(`✅ Found user: ${user.name}`);
  
  // Get all transactions
  const transactions = await prisma.transaction.findMany({
    where: { fromUserId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log(`📊 Total transactions found: ${transactions.length}`);
  
  // Group by amount to find duplicates
  const amountMap = new Map();
  const duplicateIds = [];
  const uniqueTransactions = [];
  
  for (const tx of transactions) {
    if (amountMap.has(tx.amount)) {
      // This is a duplicate
      duplicateIds.push(tx.id);
      console.log(`  🗑️ Duplicate found: $${tx.amount}`);
    } else {
      amountMap.set(tx.amount, tx.id);
      uniqueTransactions.push(tx);
    }
  }
  
  if (duplicateIds.length > 0) {
    // Delete duplicates
    await prisma.transaction.deleteMany({
      where: { id: { in: duplicateIds } }
    });
    console.log(`\n✅ Deleted ${duplicateIds.length} duplicate transactions`);
    
    // Calculate new balance
    const newBalance = uniqueTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    // Update user balance
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: JSON.stringify({ BTC: 0, ETH: 0, USDT: newBalance }) }
    });
    
    console.log(`💰 New balance: $${newBalance} USDT`);
    console.log(`📊 Unique transactions: ${uniqueTransactions.length}`);
  } else {
    console.log('✅ No duplicates found!');
  }
  
  // List all unique amounts
  console.log('\n📋 Unique transaction amounts:');
  const amounts = uniqueTransactions.map(t => t.amount).sort((a,b) => a - b);
  console.log(amounts.join(', '));
}

cleanDuplicates();