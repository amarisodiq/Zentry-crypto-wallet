const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@zentry.com' },
      update: {},
      create: {
        email: 'admin@zentry.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        walletAddress: '0xadmin123456789',
        balance: JSON.stringify({ BTC: 10, ETH: 100, USDT: 50000 })
      }
    });
    console.log('✅ Admin user created');
    
    // Create sample users
    for (let i = 1; i <= 5; i++) {
      const password = await bcrypt.hash('user123', 10);
      await prisma.user.create({
        data: {
          email: `user${i}@zentry.com`,
          password,
          name: `User ${i}`,
          walletAddress: `0xuser${i}${Math.random().toString(36).substring(2, 10)}`,
          balance: JSON.stringify({ BTC: 0.1 * i, ETH: 1 * i, USDT: 500 * i })
        }
      });
      console.log(`✅ User ${i} created`);
    }
    
    console.log('✅ Seeding complete!');
    console.log('\n📝 Test Accounts:');
    console.log('Admin: admin@zentry.com / admin123');
    console.log('Users: user1@zentry.com to user5@zentry.com / user123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });