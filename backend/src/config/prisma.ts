import { PrismaClient } from '@prisma/client'

// Prevent multiple instances in dev with hot-reload
const globalForPrisma = global as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export async function connectPrisma() {
  try {
    await prisma.$connect()
    console.log('✅ Prisma connecté à la base de données')
  } catch (err) {
    console.error('❌ Erreur de connexion Prisma:', err)
    process.exit(1)
  }
}
