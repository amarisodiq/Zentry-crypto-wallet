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
    // CUSTOM USER (nnajiubacheta@gmail.com) - CAD
    // ============================================

    const customUserEmail = "nnajiubacheta@gmail.com";
    const existingCustomUser = await prisma.user.findUnique({
      where: { email: customUserEmail },
    });

    let customUserId;

    const startingBalanceCAD = 40050.26;
    const finalBalanceCAD = 50.26;

    if (!existingCustomUser) {
      const customPassword = await bcrypt.hash("user123", 10);
      const customUser = await prisma.user.create({
        data: {
          email: customUserEmail,
          password: customPassword,
          name: "Nnajiuba cheta",
          walletAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
          balance: JSON.stringify({
            BTC: 0,
            ETH: 0,
            USDT: 0,
            CAD: startingBalanceCAD,
          }),
          isActive: true,
        },
      });
      customUserId = customUser.id;
      console.log(`✅ Custom user created (${customUserEmail} / user123)`);
    } else {
      customUserId = existingCustomUser.id;
      console.log(`✅ Custom user already exists (${customUserEmail})`);

      await prisma.user.update({
        where: { email: customUserEmail },
        data: {
          name: "Nnajiuba cheta",
          balance: JSON.stringify({
            BTC: 0,
            ETH: 0,
            USDT: 0,
            CAD: startingBalanceCAD,
          }),
        },
      });
      console.log(
        `   Updated balance to $${startingBalanceCAD.toFixed(2)} CAD`
      );

      await prisma.transaction.deleteMany({
        where: { fromUserId: customUserId },
      });
      console.log("   Cleared existing transactions");
    }

    // ============================================
    // PREVIOUS TRANSACTIONS (CAD)
    // ============================================

    const previousTransactions = [
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

    for (const tx of previousTransactions) {
      await prisma.transaction.create({ data: tx });
    }
    console.log(
      `✅ Created ${previousTransactions.length} previous transactions`
    );

    // ============================================
    // FINAL TWO TRANSACTIONS (CAD)
    // ============================================

    const finalTransactions = [
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

    for (const tx of finalTransactions) {
      await prisma.transaction.create({ data: tx });
      console.log(
        `✅ Transaction: $${tx.amount.toLocaleString()} CAD (${
          tx.type
        }) on ${tx.createdAt.toLocaleDateString()}`
      );
    }

    await prisma.user.update({
      where: { id: customUserId },
      data: {
        balance: JSON.stringify({
          BTC: 0,
          ETH: 0,
          USDT: 0,
          CAD: finalBalanceCAD,
        }),
      },
    });

    // ============================================
    // CASTILLO USER (Dalia Castillo) - USDT
    // Old transactions: April 1 - May 30, 2026
    // New transactions: May 31, 2026 (today) with $5,000 as most recent
    // ============================================

    const castilloEmail = "castillo.dalia76@yahoo.com";
    const existingCastillo = await prisma.user.findUnique({
      where: { email: castilloEmail },
    });

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create timestamps for old transactions (April 1 - May 30, 2026)
    const createOldDate = (month, day, hour, minute) => {
      return new Date(2026, month - 1, day, hour, minute);
    };
    
    // Old transaction timestamps (spread across April and May)
    const oldTimestamps = [
      createOldDate(4, 1, 10, 30),   // Apr 1, 2026 - 10:30 AM
      createOldDate(4, 5, 14, 15),   // Apr 5, 2026 - 2:15 PM
      createOldDate(4, 10, 9, 0),    // Apr 10, 2026 - 9:00 AM
      createOldDate(4, 15, 16, 45),  // Apr 15, 2026 - 4:45 PM
      createOldDate(4, 20, 11, 30),  // Apr 20, 2026 - 11:30 AM
      createOldDate(4, 25, 13, 0),   // Apr 25, 2026 - 1:00 PM
      createOldDate(4, 30, 18, 20),  // Apr 30, 2026 - 6:20 PM
      createOldDate(5, 5, 8, 45),    // May 5, 2026 - 8:45 AM
      createOldDate(5, 10, 15, 30),  // May 10, 2026 - 3:30 PM
      createOldDate(5, 15, 12, 0),   // May 15, 2026 - 12:00 PM
      createOldDate(5, 20, 17, 15),  // May 20, 2026 - 5:15 PM
      createOldDate(5, 25, 10, 0),   // May 25, 2026 - 10:00 AM
      createOldDate(5, 28, 14, 30),  // May 28, 2026 - 2:30 PM
      createOldDate(5, 29, 9, 15),   // May 29, 2026 - 9:15 AM
      createOldDate(5, 29, 19, 0),   // May 29, 2026 - 7:00 PM
      createOldDate(5, 30, 11, 45),  // May 30, 2026 - 11:45 AM
      createOldDate(5, 30, 16, 30),  // May 30, 2026 - 4:30 PM
      createOldDate(5, 30, 21, 0),   // May 30, 2026 - 9:00 PM
    ];
    
    // Today's timestamps (new transactions - May 31, 2026)
    const createTodayTime = (hour, minute) => {
      const date = new Date(today);
      date.setHours(hour, minute, 0, 0);
      return date;
    };
    
    const newTimestamps = [
      createTodayTime(9, 0),    // 9:00 AM
      createTodayTime(10, 30),  // 10:30 AM
      createTodayTime(12, 0),   // 12:00 PM
      createTodayTime(13, 30),  // 1:30 PM
      createTodayTime(15, 0),   // 3:00 PM
      createTodayTime(16, 30),  // 4:30 PM
      createTodayTime(18, 0),   // 6:00 PM
      createTodayTime(19, 30),  // 7:30 PM
      createTodayTime(21, 0),   // 9:00 PM
      createTodayTime(22, 30),  // 10:30 PM
      createTodayTime(23, 0),   // 11:00 PM
      createTodayTime(23, 30),  // 11:30 PM
      createTodayTime(23, 45),  // 11:45 PM
      createTodayTime(23, 59),  // 11:59 PM ($5,000 gets this)
    ];

    // All transaction amounts (organized: old amounts first, then new amounts)
    // Old transaction amounts (before today)
    const oldAmounts = [
      150, 3600, 1530, 650, 750, 273, 500, 15, 200, 250, 20, 10,
      3000, 2000, 1000, 200, 25, 50, 400, 80,
      2000, 1000, 500, 200, 100, 450, 125, 132, 962, 700, 5000, 800, 31,
      50, 20, 13, 27, 82, 95, 34, 80, 26, 31,
      5000, 5000, 5000, 3000, 3000, 1000, 500, 31.38,
      1200,
      15.82, 53.67, 92.79, 67.03, 150.32, 210.69,
      95, 140, 67, 210, 88, 175, 120, 54, 160, 132, 76, 143, 99, 180, 61,
      15, 18, 23, 67, 32, 31, 13, 61,
    ];
    
    // New transaction amounts (today - May 31, 2026)
    const newAmounts = [
      160, 230, 40, 100,
      5000  // $5,000 LAST - most recent
    ];
    
    // Combine: old amounts first (older dates), then new amounts (today)
    const allAmounts = [...oldAmounts, ...newAmounts];
    
    // Combine timestamps: old timestamps first, then today's timestamps
    const allTimestamps = [...oldTimestamps, ...newTimestamps];
    
    const totalCastilloBalance = allAmounts.reduce((a, b) => a + b, 0);

    if (!existingCastillo) {
      const castilloPassword = await bcrypt.hash("Castillo$94", 10);
      const castilloUser = await prisma.user.create({
        data: {
          email: castilloEmail,
          password: castilloPassword,
          name: "Dalia Castillo",
          walletAddress: `0xd44b0c9a8f3e7b2c1d5a6f8e9c0d1e2f3a4b5c6d`,
          balance: JSON.stringify({ BTC: 0, ETH: 0, USDT: totalCastilloBalance }),
          isActive: true,
        },
      });
      
      for (let i = 0; i < allAmounts.length; i++) {
        const amount = allAmounts[i];
        const timestamp = allTimestamps[i % allTimestamps.length];
        await prisma.transaction.create({
          data: {
            fromUserId: castilloUser.id,
            fromAddress: castilloUser.walletAddress,
            toAddress: castilloUser.walletAddress,
            amount: amount,
            currency: "USDT",
            status: "CONFIRMED",
            type: "RECEIVE",
            txHash: `Deposit_${amount}_USDT_${Date.now()}_${i}`,
            createdAt: timestamp,
          },
        });
      }
      console.log(`✅ Castillo user created with balance $${totalCastilloBalance.toFixed(2)} USDT`);
      console.log(`✅ Old transactions: April 1 - May 30, 2026`);
      console.log(`✅ New transactions: May 31, 2026 with $5,000 as most recent`);
    } else {
      console.log("\n✅ Castillo user already exists, updating with correct dates...");
      
      // Delete existing transactions to avoid duplicates
      await prisma.transaction.deleteMany({
        where: { fromUserId: existingCastillo.id },
      });
      console.log("   🗑️ Cleared existing transactions");
      
      // Update balance to new total
      await prisma.user.update({
        where: { email: castilloEmail },
        data: {
          name: "Dalia Castillo",
          balance: JSON.stringify({ BTC: 0, ETH: 0, USDT: totalCastilloBalance }),
        },
      });
      
      // Add all transactions with proper dates
      for (let i = 0; i < allAmounts.length; i++) {
        const amount = allAmounts[i];
        const timestamp = allTimestamps[i % allTimestamps.length];
        await prisma.transaction.create({
          data: {
            fromUserId: existingCastillo.id,
            fromAddress: existingCastillo.walletAddress,
            toAddress: existingCastillo.walletAddress,
            amount: amount,
            currency: "USDT",
            status: "CONFIRMED",
            type: "RECEIVE",
            txHash: `Deposit_${amount}_USDT_${Date.now()}_${i}`,
            createdAt: timestamp,
          },
        });
        if (amount === 5000 && i === allAmounts.length - 1) {
          console.log(`   ✅ Added: $${amount} USDT (MOST RECENT - today at 11:59 PM)`);
        }
      }
      
      console.log(`   ✅ Updated balance: $${totalCastilloBalance.toFixed(2)} USDT`);
      console.log(`   ✅ Total transactions: ${allAmounts.length}`);
      console.log(`   ✅ Old transactions: April 1 - May 30, 2026`);
      console.log(`   ✅ New transactions: May 31, 2026 (today) with $5,000 as most recent`);
    }

    // ============================================
    // FINAL OUTPUT
    // ============================================

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📝 Available Test Accounts:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:        admin@zentry.com / admin123");
    console.log("User 1:       user1@zentry.com / user123");
    console.log("User 2:       user2@zentry.com / user123");
    console.log("User 3:       user3@zentry.com / user123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎯 NNAJIUBA USER (CAD):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email:        nnajiubacheta@gmail.com");
    console.log("Password:     user123");
    console.log(`Balance:      $${finalBalanceCAD.toFixed(2)} CAD`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👤 CASTILLO USER (USDT):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email:        castillo.dalia76@yahoo.com");
    console.log("Password:     Castillo$94");
    console.log("Name:         Dalia Castillo");
    console.log(`Balance:      $${totalCastilloBalance.toFixed(2)} USDT`);
    console.log(`Old Transactions: April 1 - May 30, 2026 (${oldAmounts.length} transactions)`);
    console.log(`New Transactions: May 31, 2026 - TODAY (${newAmounts.length} transactions)`);
    console.log(`💰 $5,000 is the MOST RECENT transaction (today at 11:59 PM)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seed().catch(console.error);
}

module.exports = { seed };