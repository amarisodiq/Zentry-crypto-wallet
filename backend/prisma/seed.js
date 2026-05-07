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

      // ❌ REMOVE THIS DELETE LINE - DO NOT DELETE EXISTING TRANSACTIONS
      // await prisma.transaction.deleteMany({
      //   where: { fromUserId: customUserId },
      // });
      // console.log("   Cleared existing transactions");
    }

    // ============================================
    // PREVIOUS TRANSACTIONS (CAD) - ONLY CREATE IF NOT EXISTS
    // ============================================
    
    // Check existing transactions first
    const existingCADTransactions = await prisma.transaction.findMany({
      where: { fromUserId: customUserId }
    });
    const existingCADAmounts = existingCADTransactions.map(tx => tx.amount);

    const allCADTransactions = [
      { amount: 900, date: "2026-02-02T10:30:00Z", type: "SEND" },
      { amount: 3500, date: "2026-01-25T14:30:00Z", type: "RECEIVE" },
      { amount: 1300, date: "2026-01-10T09:15:00Z", type: "RECEIVE" },
      { amount: 600, date: "2025-12-28T11:00:00Z", type: "SEND" },
      { amount: 4200, date: "2025-12-15T16:45:00Z", type: "RECEIVE" },
      { amount: 950, date: "2025-12-03T08:20:00Z", type: "SEND" },
      { amount: 3000, date: "2025-11-22T13:00:00Z", type: "RECEIVE" },
      { amount: 1700, date: "2025-11-08T17:30:00Z", type: "RECEIVE" },
      { amount: 700, date: "2025-10-30T10:00:00Z", type: "SEND" },
      { amount: 3600, date: "2025-10-14T19:15:00Z", type: "RECEIVE" },
      { amount: 1200, date: "2025-10-01T12:00:00Z", type: "SEND" },
      { amount: 2900, date: "2025-09-20T15:30:00Z", type: "RECEIVE" },
      { amount: 1500, date: "2025-09-05T11:45:00Z", type: "RECEIVE" },
      { amount: 800, date: "2025-08-25T09:00:00Z", type: "SEND" },
      { amount: 3200, date: "2025-08-12T14:20:00Z", type: "RECEIVE" },
      { amount: 1600, date: "2025-07-29T18:10:00Z", type: "RECEIVE" },
      { amount: 650, date: "2025-07-15T08:30:00Z", type: "SEND" },
      { amount: 3400, date: "2025-06-28T20:00:00Z", type: "RECEIVE" },
      { amount: 1400, date: "2025-06-10T13:25:00Z", type: "RECEIVE" },
      { amount: 750, date: "2025-05-26T07:45:00Z", type: "SEND" },
      { amount: 3100, date: "2025-05-12T16:50:00Z", type: "RECEIVE" },
      { amount: 1700, date: "2025-04-30T11:00:00Z", type: "RECEIVE" },
      { amount: 900, date: "2025-04-18T09:30:00Z", type: "SEND" },
    ];

    let cadAddedCount = 0;
    for (const tx of allCADTransactions) {
      if (!existingCADAmounts.includes(tx.amount)) {
        await prisma.transaction.create({
          data: {
            fromUserId: customUserId,
            fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
            toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
            amount: tx.amount,
            currency: "CAD",
            status: "CONFIRMED",
            type: tx.type,
            txHash: `0x${Date.now()}cad_${tx.amount}_${Math.random().toString(36)}`,
            createdAt: new Date(tx.date),
          },
        });
        cadAddedCount++;
      }
    }
    console.log(`✅ Added ${cadAddedCount} new CAD transactions`);

    // ============================================
    // FINAL TWO TRANSACTIONS (CAD)
    // ============================================
    
    const finalCADAmounts = [17000, 23000];
    for (const amount of finalCADAmounts) {
      if (!existingCADAmounts.includes(amount)) {
        await prisma.transaction.create({
          data: {
            fromUserId: customUserId,
            fromAddress: "0xC4f8A1d92b7E5F3c6D0a9B8eF2C1d7A4e6b3F9D2",
            toAddress: "0x7A3c9F5e2D8B41a6C0E9f4b3A1d6F8C2b7e9D4a1",
            amount: amount,
            currency: "CAD",
            status: "CONFIRMED",
            type: "SEND",
            txHash: `0x${Date.now()}final_${amount}_${Math.random().toString(36)}`,
            createdAt: amount === 17000 ? new Date("2026-02-19T10:30:00Z") : new Date("2026-02-19T14:45:00Z"),
          },
        });
        console.log(`✅ Added final transaction: $${amount} CAD`);
      }
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
    // ONLY ADD MISSING TRANSACTIONS, NEVER DELETE
    // ============================================

    const castilloEmail = "castillo.dalia76@yahoo.com";
    const existingCastillo = await prisma.user.findUnique({
      where: { email: castilloEmail },
    });

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const allUSDTAmounts = [
      150, 3600, 1530, 650, 750, 273, 500, 15, 200, 250, 20, 10,
      3000, 2000, 1000, 2000, 200, 25, 50, 15, 10, 2000,
      400, 150, 80,
      2000, 1000, 500, 200, 100, 450, 125, 132, 962, 700, 5000, 800, 31,
      50, 20, 13, 27, 82, 95, 34, 80, 26, 50, 31
    ];
    
    const totalUSDTBalance = allUSDTAmounts.reduce((a, b) => a + b, 0);

    if (!existingCastillo) {
      const castilloPassword = await bcrypt.hash("Castillo$94", 10);
      const castilloUser = await prisma.user.create({
        data: {
          email: castilloEmail,
          password: castilloPassword,
          name: "Dalia Castillo",
          walletAddress: `0x${Math.random().toString(36).substring(2, 15)}`,
          balance: JSON.stringify({ BTC: 0, ETH: 0, USDT: totalUSDTBalance }),
          isActive: true,
        },
      });
      
      // Add all transactions for new user
      for (let i = 0; i < allUSDTAmounts.length; i++) {
        const amount = allUSDTAmounts[i];
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
            createdAt: new Date(`${todayStr}T${Math.min(9 + i, 21)}:00:00Z`),
          },
        });
      }
      console.log(`✅ Castillo user created with ${allUSDTAmounts.length} transactions`);
    } else {
      console.log("\n✅ Castillo user already exists, checking for missing transactions...");
      
      const existingUSDTTransactions = await prisma.transaction.findMany({
        where: { fromUserId: existingCastillo.id }
      });
      const existingUSDTAmounts = existingUSDTTransactions.map(tx => tx.amount);
      
      let addedCount = 0;
      for (const amount of allUSDTAmounts) {
        if (!existingUSDTAmounts.includes(amount)) {
          await prisma.transaction.create({
            data: {
              fromUserId: existingCastillo.id,
              fromAddress: existingCastillo.walletAddress,
              toAddress: existingCastillo.walletAddress,
              amount: amount,
              currency: "USDT",
              status: "CONFIRMED",
              type: "RECEIVE",
              txHash: `Deposit_${amount}_USDT_${Date.now()}_${Math.random()}`,
              createdAt: new Date(),
            },
          });
          addedCount++;
        }
      }
      
      // Update balance
      await prisma.user.update({
        where: { email: castilloEmail },
        data: {
          name: "Dalia Castillo",
          balance: JSON.stringify({ BTC: 0, ETH: 0, USDT: totalUSDTBalance }),
        },
      });
      
      console.log(`   Added ${addedCount} missing transactions`);
      console.log(`   Total balance: $${totalUSDTBalance} USDT`);
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
    console.log(`Balance:      $${totalUSDTBalance} USDT`);
    console.log(`Total Transactions: ${allUSDTAmounts.length} (ALL CONFIRMED)`);
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