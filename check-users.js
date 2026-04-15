const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['odirickd@gmail.com', 'koladigitalentreprise@gmail.com']
        }
      }
    });
    console.log("Users in public.Users:", users);
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
