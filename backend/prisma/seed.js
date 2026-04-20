const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@zentry.com" },
    });

    if (!existingAdmin) {
      // Create admin user
      const adminPassword = await bcrypt.hash("admin123", 10);
      await prisma.user.create({
        data: {
          email: "admin@zentry.com",
          password: adminPassword,
          name: "Admin User",
          role: "ADMIN",
          walletAddress: "0xadmin123456789",
          balance: JSON.stringify({ BTC: 10, ETH: 100, USDT: 50000 }),
          isActive: true,
        },
      });
      console.log("✅ Admin user created (admin@zentry.com / admin123)");
    } else {
      console.log("✅ Admin user already exists");
    }

    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "user1@zentry.com" },
    });

    if (!existingUser) {
      // Create test user
      const userPassword = await bcrypt.hash("user123", 10);
      await prisma.user.create({
        data: {
          email: "user1@zentry.com",
          password: userPassword,
          name: "Test User",
          walletAddress: "0xuser123456789",
          balance: JSON.stringify({ BTC: 1.5, ETH: 5.2, USDT: 2500 }),
          isActive: true,
        },
      });
      console.log("✅ Test user created (user1@zentry.com / user123)");
    } else {
      console.log("✅ Test user already exists");
    }

    // Create additional test users
    for (let i = 2; i <= 3; i++) {
      const existing = await prisma.user.findUnique({
        where: { email: `user${i}@zentry.com` },
      });

      if (!existing) {
        const password = await bcrypt.hash("user123", 10);
        await prisma.user.create({
          data: {
            email: `user${i}@zentry.com`,
            password,
            name: `Test User ${i}`,
            walletAddress: `0xuser${i}${Math.random()
              .toString(36)
              .substring(2, 10)}`,
            balance: JSON.stringify({
              BTC: 0.5 * i,
              ETH: 2 * i,
              USDT: 500 * i,
            }),
            isActive: true,
          },
        });
        console.log(
          `✅ Test user ${i} created (user${i}@zentry.com / user123)`
        );
      }
    }

    // ============================================
    // CUSTOM USER WITH SPECIFIC TRANSACTIONS
    // USING YOUR EMAIL: nnajiubacheta@gmail.com
    // ============================================

    const customUserEmail = "nnajiubacheta@gmail.com";
    const existingCustomUser = await prisma.user.findUnique({
      where: { email: customUserEmail },
    });

    let customUserId;

    if (!existingCustomUser) {
      // Create the custom user with $50.32 balance
      const customPassword = await bcrypt.hash("user123", 10);
      const customUser = await prisma.user.create({
        data: {
          email: customUserEmail,
          password: customPassword,
          name: "Nnajiuba cheta",
          walletAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
          balance: JSON.stringify({
            BTC: 0.00116, // Approximately $50.32 USD worth of BTC
            ETH: 0,
            USDT: 0,
            CAD: 50.32,
          }),
          isActive: true,
        },
      });
      customUserId = customUser.id;
      console.log(`✅ Custom user created (${customUserEmail} / user123)`);
      console.log("   Balance: $50.32 CAD");
    } else {
      customUserId = existingCustomUser.id;
      console.log(`✅ Custom user already exists (${customUserEmail})`);

      // Update balance to $50.32 if needed
      await prisma.user.update({
        where: { email: customUserEmail },
        data: {
          name: "Nnajiuba cheta",
          balance: JSON.stringify({
            BTC: 0.00116,
            ETH: 0,
            USDT: 0,
            CAD: 50.32,
          }),
        },
      });
      console.log("   Updated balance to $50.32 CAD");

      // Delete existing transactions for this user to avoid duplicates
      await prisma.transaction.deleteMany({
        where: { fromUserId: customUserId },
      });
      console.log("   Cleared existing transactions");
    }

    // Create the two Bitcoin transactions in CAD
    const transactions = [
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 17000,
        currency: "CAD",
        status: "CONFIRMED",
        type: "SEND",
        txHash: `0x${Date.now()}a1b2c3d4e5f6g7h8i9j0`,
        createdAt: new Date("2026-02-19T10:30:00Z"),
      },
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 23000,
        currency: "CAD",
        status: "CONFIRMED",
        type: "SEND",
        txHash: `0x${Date.now()}k1l2m3n4o5p6q7r8s9t0`,
        createdAt: new Date("2026-02-19T14:45:00Z"),
      },
    ];

    for (const tx of transactions) {
      await prisma.transaction.create({ data: tx });
      console.log(
        `✅ Transaction created: $${tx.amount.toLocaleString()} CAD (Bitcoin) sent on ${tx.createdAt.toLocaleDateString()}`
      );
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📝 Available Test Accounts:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:        admin@zentry.com / admin123");
    console.log("User 1:       user1@zentry.com / user123");
    console.log("User 2:       user2@zentry.com / user123");
    console.log("User 3:       user3@zentry.com / user123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎯 CUSTOM USER (What you requested):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email:        nnajiubacheta@gmail.com");
    console.log("Password:     user123");
    console.log("Name:         Nnajiuba cheta");
    console.log("Balance:      $50.32 CAD");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📅 Transaction History for Custom User:");
    console.log("  • February 19, 2026 - $17,000 CAD (Bitcoin) sent");
    console.log("  • February 19, 2026 - $23,000 CAD (Bitcoin) sent");
    console.log("  • February 02, 2026 - $900 CAD (Bitcoin) sent");
    console.log("  • January 25, 2026 - $3,500 CAD (Bitcoin) received");
    console.log("  • January 10, 2026 - $1,300 CAD (Bitcoin) received");
    console.log("  • December 28, 2025 - $600 CAD (Bitcoin) sent");
    console.log("  • December 15, 2025 - $4,200 CAD (Bitcoin) received");
    console.log("  • December 03, 2025 - $950 CAD (Bitcoin) sent");
    console.log("  • November 22, 2025 - $3,000 CAD (Bitcoin) received");
    console.log("  • November 08, 2025 - $1,700 CAD (Bitcoin) received");
    console.log("  • October 30, 2025 - $700 CAD (Bitcoin) sent");
    console.log("  • October 14, 2025 - $3,600 CAD (Bitcoin) received");
    console.log("  • October 01, 2025 - $1,200 CAD (Bitcoin) sent");
    console.log("  • September 20, 2025 - $2,900 CAD (Bitcoin) received");
    console.log("  • September 05, 2025 - $1,500 CAD (Bitcoin) received");
    console.log("  • August 25, 2025 - $800 CAD (Bitcoin) sent");
    console.log("  • August 12, 2025 - $3,200 CAD (Bitcoin) received");
    console.log("  • July 29, 2025 - $1,600 CAD (Bitcoin) received");
    console.log("  • July 15, 2025 - $650 CAD (Bitcoin) sent");
    console.log("  • June 28, 2025 - $3,400 CAD (Bitcoin) received");
    console.log("  • June 10, 2025 - $1,400 CAD (Bitcoin) received");
    console.log("  • May 26, 2025 - $750 CAD (Bitcoin) sent");
    console.log("  • May 12, 2025 - $3,100 CAD (Bitcoin) received");
    console.log("  • April 30, 2025 - $1,700 CAD (Bitcoin) received");
    console.log("  • April 18, 2025 - $900 CAD (Bitcoin) sent");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
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
