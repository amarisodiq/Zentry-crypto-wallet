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
            BTC: 0.00116,
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

    // ============================================
    // ALL TRANSACTIONS FOR CUSTOM USER
    // ============================================
    
    const transactions = [
      // February 2026 transactions
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
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 900,
        currency: "CAD",
        status: "CONFIRMED",
        type: "SEND",
        txHash: `0x${Date.now()}feb900${Math.random().toString(36)}`,
        createdAt: new Date("2026-02-02T10:30:00Z"),
      },
      
      // January 2026 transactions
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 3500,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}jan3500${Math.random().toString(36)}`,
        createdAt: new Date("2026-01-25T14:30:00Z"),
      },
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 1300,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}jan1300${Math.random().toString(36)}`,
        createdAt: new Date("2026-01-10T09:15:00Z"),
      },
      
      // December 2025 transactions
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 600,
        currency: "CAD",
        status: "CONFIRMED",
        type: "SEND",
        txHash: `0x${Date.now()}dec600${Math.random().toString(36)}`,
        createdAt: new Date("2025-12-28T11:00:00Z"),
      },
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 4200,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}dec4200${Math.random().toString(36)}`,
        createdAt: new Date("2025-12-15T16:45:00Z"),
      },
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 950,
        currency: "CAD",
        status: "CONFIRMED",
        type: "SEND",
        txHash: `0x${Date.now()}dec950${Math.random().toString(36)}`,
        createdAt: new Date("2025-12-03T08:20:00Z"),
      },
      
      // November 2025 transactions
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 3000,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}nov3000${Math.random().toString(36)}`,
        createdAt: new Date("2025-11-22T13:00:00Z"),
      },
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 1700,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}nov1700${Math.random().toString(36)}`,
        createdAt: new Date("2025-11-08T17:30:00Z"),
      },
      
      // October 2025 transactions
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 700,
        currency: "CAD",
        status: "CONFIRMED",
        type: "SEND",
        txHash: `0x${Date.now()}oct700${Math.random().toString(36)}`,
        createdAt: new Date("2025-10-30T10:00:00Z"),
      },
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 3600,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}oct3600${Math.random().toString(36)}`,
        createdAt: new Date("2025-10-14T19:15:00Z"),
      },
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 1200,
        currency: "CAD",
        status: "CONFIRMED",
        type: "SEND",
        txHash: `0x${Date.now()}oct1200${Math.random().toString(36)}`,
        createdAt: new Date("2025-10-01T12:00:00Z"),
      },
      
      // September 2025 transactions
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 2900,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}sep2900${Math.random().toString(36)}`,
        createdAt: new Date("2025-09-20T15:30:00Z"),
      },
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 1500,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}sep1500${Math.random().toString(36)}`,
        createdAt: new Date("2025-09-05T11:45:00Z"),
      },
      
      // August 2025 transactions
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 800,
        currency: "CAD",
        status: "CONFIRMED",
        type: "SEND",
        txHash: `0x${Date.now()}aug800${Math.random().toString(36)}`,
        createdAt: new Date("2025-08-25T09:00:00Z"),
      },
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 3200,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}aug3200${Math.random().toString(36)}`,
        createdAt: new Date("2025-08-12T14:20:00Z"),
      },
      
      // July 2025 transactions
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 1600,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}jul1600${Math.random().toString(36)}`,
        createdAt: new Date("2025-07-29T18:10:00Z"),
      },
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 650,
        currency: "CAD",
        status: "CONFIRMED",
        type: "SEND",
        txHash: `0x${Date.now()}jul650${Math.random().toString(36)}`,
        createdAt: new Date("2025-07-15T08:30:00Z"),
      },
      
      // June 2025 transactions
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 3400,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}jun3400${Math.random().toString(36)}`,
        createdAt: new Date("2025-06-28T20:00:00Z"),
      },
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 1400,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}jun1400${Math.random().toString(36)}`,
        createdAt: new Date("2025-06-10T13:25:00Z"),
      },
      
      // May 2025 transactions
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 750,
        currency: "CAD",
        status: "CONFIRMED",
        type: "SEND",
        txHash: `0x${Date.now()}may750${Math.random().toString(36)}`,
        createdAt: new Date("2025-05-26T07:45:00Z"),
      },
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 3100,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}may3100${Math.random().toString(36)}`,
        createdAt: new Date("2025-05-12T16:50:00Z"),
      },
      
      // April 2025 transactions
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 1700,
        currency: "CAD",
        status: "CONFIRMED",
        type: "RECEIVE",
        txHash: `0x${Date.now()}apr1700${Math.random().toString(36)}`,
        createdAt: new Date("2025-04-30T11:00:00Z"),
      },
      {
        fromUserId: customUserId,
        fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
        toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
        amount: 900,
        currency: "CAD",
        status: "CONFIRMED",
        type: "SEND",
        txHash: `0x${Date.now()}apr900${Math.random().toString(36)}`,
        createdAt: new Date("2025-04-18T09:30:00Z"),
      },
    ];

    // Create all transactions in the database
    for (const tx of transactions) {
      await prisma.transaction.create({ data: tx });
      console.log(
        `✅ Transaction: $${tx.amount.toLocaleString()} CAD (${tx.type}) on ${tx.createdAt.toLocaleDateString()}`
      );
    }

    // Calculate new balance based on all transactions
    let calculatedBalance = 50.32; // Starting balance
    for (const tx of transactions) {
      if (tx.currency === "CAD") {
        if (tx.type === "SEND") {
          calculatedBalance -= tx.amount;
        } else if (tx.type === "RECEIVE") {
          calculatedBalance += tx.amount;
        }
      }
    }

    // Update user's balance to reflect all transactions
    await prisma.user.update({
      where: { id: customUserId },
      data: {
        balance: JSON.stringify({
          BTC: 0.00116,
          ETH: 0,
          USDT: 0,
          CAD: calculatedBalance,
        }),
      },
    });

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📝 Available Test Accounts:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:        admin@zentry.com / admin123");
    console.log("User 1:       user1@zentry.com / user123");
    console.log("User 2:       user2@zentry.com / user123");
    console.log("User 3:       user3@zentry.com / user123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎯 CUSTOM USER:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email:        nnajiubacheta@gmail.com");
    console.log("Password:     user123");
    console.log("Name:         Nnajiuba cheta");
    console.log(`Balance:      $${calculatedBalance.toFixed(2)} CAD`);
    console.log(`Transactions: ${transactions.length} total`);
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