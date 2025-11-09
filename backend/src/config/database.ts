import { connectPrisma } from './prisma'

export const connectDB = async () => {
  await connectPrisma()
}

export const getDB = () => {
  throw new Error('getDB() n\'est plus utilisé. Utilisez directement prisma depuis "config/prisma"')
}
