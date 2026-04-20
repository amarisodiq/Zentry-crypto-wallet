const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updatePassword() {
  const email = 'nnajiubacheta@gmail.com';
  const newPassword = 'user123';
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });
  
  console.log(`✅ Password updated for ${user.email}`);
  console.log(`New password: ${newPassword}`);
}

updatePassword();