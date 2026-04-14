const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const logs = await prisma.legalAcceptanceLog.findMany({ take: 1 });
    console.log("Success with Prisma:", logs);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
