const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@zentry.com' }
    });
    
    if (!existingAdmin) {
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
      console.log('✅ Admin user created (admin@zentry.com / admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'user1@zentry.com' }
    });
    
    if (!existingUser) {
      // Create test user
      const userPassword = await bcrypt.hash('user123', 10);
      await prisma.user.create({
        data: {
          email: 'user1@zentry.com',
          password: userPassword,
          name: 'Test User',
          walletAddress: '0xuser123456789',
          balance: JSON.stringify({ BTC: 1.5, ETH: 5.2, USDT: 2500 }),
          isActive: true
        }
      });
      console.log('✅ Test user created (user1@zentry.com / user123)');
    } else {
      console.log('✅ Test user already exists');
    }
    
    // Create additional test users
    for (let i = 2; i <= 3; i++) {
      const existing = await prisma.user.findUnique({
        where: { email: `user${i}@zentry.com` }
      });
      
      if (!existing) {
        const password = await bcrypt.hash('user123', 10);
        await prisma.user.create({
          data: {
            email: `user${i}@zentry.com`,
            password,
            name: `Test User ${i}`,
            walletAddress: `0xuser${i}${Math.random().toString(36).substring(2, 10)}`,
            balance: JSON.stringify({ BTC: 0.5 * i, ETH: 2 * i, USDT: 500 * i }),
            isActive: true
          }
        });
        console.log(`✅ Test user ${i} created (user${i}@zentry.com / user123)`);
      }
    }
    
    console.log('\n📝 Available Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:   admin@zentry.com / admin123');
    console.log('User 1:  user1@zentry.com / user123');
    console.log('User 2:  user2@zentry.com / user123');
    console.log('User 3:  user3@zentry.com / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seed().catch(console.error);
}

module.exports = { seed };