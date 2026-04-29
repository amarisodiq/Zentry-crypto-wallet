const { PrismaClient } = require('@prisma/client');

// This will use the DATABASE_URL from environment variables
// On Render, it will connect to PostgreSQL
const prisma = new PrismaClient();

async function fixCastilloToUSD() {
  console.log('🔄 Fixing Castillo user to USD...');
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'castillo.dalia76@yahoo.com' }
    });
    
    if (!user) {
      console.log('❌ Castillo user not found!');
      return;
    }
    
    console.log(`✅ Found user: ${user.name}`);
    
    // Update balance to USD
    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: JSON.stringify({ BTC: 0, ETH: 0, USDT: 0, USD: 150 })
      }
    });
    console.log('✅ Balance updated to $150 USD');
    
    // Find and update transaction to USD
    const transaction = await prisma.transaction.findFirst({
      where: { fromUserId: user.id, amount: 150 }
    });
    
    if (transaction) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { currency: 'USD' }
      });
      console.log('✅ Transaction currency updated to USD');
    }
    
    console.log('\n✅ Castillo user fixed!');
    console.log('Balance: $150 USD');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCastilloToUSD();