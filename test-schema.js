const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'legal_acceptance_logs';
    `
    console.log("Columns:", columns)
  } catch(e) {
    console.error(e)
  }
}
main()
