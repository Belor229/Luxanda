import { prisma } from './prisma'

export async function logAdminAction(
  adminId: string,
  action: string,
  targetId?: string,
  details?: any
) {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        targetId,
        details: details ? JSON.stringify(details) : null,
      },
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}
