import express, { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { authenticateToken, requireAdmin } from '../middlewares/auth'
import { Prisma } from '@prisma/client'

const router = express.Router()

interface UserWithProfile {
  profile: {
    firstName: string | null
    lastName: string | null
  } | null
  email: string
  role: string
  createdAt: Date
}

interface ProductWithVendor {
  name: string
  price: number
  vendor: {
    user: {
      profile: {
        firstName: string | null
        lastName: string | null
      } | null
    }
  } | null
  createdAt: Date
}

interface SubscriptionWithUser {
  plan: string
  amount: number
  status: string
  user: {
    profile: {
      firstName: string | null
      lastName: string | null
    } | null
  }
  createdAt: Date
}

// Admin dashboard stats
router.get('/dashboard', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Users stats
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: { profile: { isNot: null } } // Assuming active users have profiles
    })
    const vendors = await prisma.user.count({
      where: { role: 'VENDOR' }
    })

    // Products stats
    const totalProducts = await prisma.product.count()
    const activeProducts = await prisma.product.count({
      where: { status: 'ACTIVE' }
    })
    const featuredProducts = await prisma.product.count({
      where: { featured: true }
    })

    // Subscriptions stats
    const totalSubscriptions = await prisma.subscription.count()
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE' }
    })
    const pendingSubscriptions = await prisma.subscription.count({
      where: { status: 'PENDING' }
    })

    // Revenue stats
    const totalRevenue = await prisma.subscription.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: 'ACTIVE',
        startDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })

    // Recent activities
    const recentUsers = await prisma.user.findMany({
      select: {
        profile: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const recentProducts = await prisma.product.findMany({
      select: {
        name: true,
        price: true,
        vendor: {
          select: {
            user: {
              select: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        },
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const recentSubscriptions = await prisma.subscription.findMany({
      select: {
        plan: true,
        amount: true,
        status: true,
        user: {
          select: {
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    res.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          vendors: vendors
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          featured: featuredProducts
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          pending: pendingSubscriptions
        },
        revenue: {
          thisMonth: totalRevenue._sum.amount || 0
        }
      },
      recentActivities: {
        users: recentUsers.map((user: UserWithProfile) => ({
          firstName: user.profile?.firstName,
          lastName: user.profile?.lastName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        })),
        products: recentProducts.map((product: ProductWithVendor) => ({
          name: product.name,
          price: product.price,
          firstName: product.vendor?.user?.profile?.firstName,
          lastName: product.vendor?.user?.profile?.lastName,
          createdAt: product.createdAt
        })),
        subscriptions: recentSubscriptions.map((sub: SubscriptionWithUser) => ({
          plan: sub.plan,
          amount: sub.amount,
          status: sub.status,
          firstName: sub.user?.profile?.firstName,
          lastName: sub.user?.profile?.lastName,
          createdAt: sub.createdAt
        }))
      }
    })

  } catch (error) {
    console.error('Admin dashboard error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques'
    })
  }
})

// Get all contact messages
router.get('/contact-messages', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query

    const whereClause: Prisma.ContactMessageWhereInput = {}
    if (status) {
      // Map string status to enum value
      const statusMap: Record<string, 'NEW' | 'READ' | 'REPLIED'> = {
        'new': 'NEW',
        'read': 'READ',
        'replied': 'REPLIED',
        'NEW': 'NEW',
        'READ': 'READ',
        'REPLIED': 'REPLIED'
      }
      const statusEnum = statusMap[String(status).toUpperCase()]
      if (statusEnum) {
        whereClause.status = statusEnum
      }
    }

    const messages = await prisma.contactMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    })

    const total = await prisma.contactMessage.count({
      where: whereClause
    })

    res.json({
      messages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })

  } catch (error) {
    console.error('Get contact messages error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des messages'
    })
  }
})

interface UpdateMessageStatusRequest {
  id: string
}
interface UpdateMessageStatusBody {
  status: string
}

// Update message status
router.patch('/contact-messages/:id/status', [
  requireAdmin
], authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as unknown as UpdateMessageStatusRequest
    const { status } = req.body as UpdateMessageStatusBody

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID message invalide' })
    }

    // Map string status to enum value
    const statusMap: Record<string, 'NEW' | 'READ' | 'REPLIED'> = {
      'new': 'NEW',
      'read': 'READ',
      'replied': 'REPLIED',
      'NEW': 'NEW',
      'READ': 'READ',
      'REPLIED': 'REPLIED'
    }

    const statusEnum = statusMap[String(status).toUpperCase()]
    if (!statusEnum) {
      return res.status(400).json({
        error: 'Statut invalide. Valeurs acceptées: new, read, replied'
      })
    }

    await prisma.contactMessage.update({
      where: { id },
      data: { status: statusEnum }
    })

    res.json({
      message: 'Statut du message mis à jour avec succès'
    })

  } catch (error) {
    console.error('Update message status error:', error)
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du statut'
    })
  }
})

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { role, page = 1, limit = 50 } = req.query
    const where: Prisma.UserWhereInput = {}
    if (role) {
      const roleString = String(role).toUpperCase()
      if (['USER', 'VENDOR', 'ADMIN'].includes(roleString)) {
        where.role = roleString as 'USER' | 'VENDOR' | 'ADMIN'
      }
    }

    const users = await prisma.user.findMany({
      where,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    })

    const total = await prisma.user.count({ where })

    res.json({
      users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' })
  }
})

interface UpdateUserRoleRequest {
  id: string
}
interface UpdateUserRoleBody {
  role: string
}

// Update user role
router.patch('/users/:id/role', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as unknown as UpdateUserRoleRequest
    const { role } = req.body as UpdateUserRoleBody

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID utilisateur invalide' })
    }

    if (!role || !['USER', 'VENDOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide. Valeurs acceptées: USER, VENDOR, ADMIN' })
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: role as 'USER' | 'VENDOR' | 'ADMIN' }
    })

    res.json({ message: 'Rôle mis à jour', user })
  } catch (error) {
    console.error('Update user role error:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle' })
  }
})

interface VendorStatus {
  PENDING_VALIDATION: string
  APPROVED: string
  REJECTED: string
  SUSPENDED: string
  SUSPENDED_AUTO: string
}

const VENDOR_STATUS: VendorStatus = {
  PENDING_VALIDATION: 'PENDING_VALIDATION',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  SUSPENDED_AUTO: 'SUSPENDED_AUTO'
}

interface VendorWhereInput {
  status?: keyof VendorStatus
}

// Get all vendors
router.get('/vendors', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 50 } = req.query
    const where: VendorWhereInput = {}
    if (status && Object.values(VENDOR_STATUS).includes(String(status))) {
      where.status = String(status) as keyof VendorStatus
    }

    const vendors = await prisma.vendor.findMany({
      where,
      include: { user: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    })

    const total = await prisma.vendor.count({ where })

    res.json({
      vendors,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    })
  } catch (error) {
    console.error('Get vendors error:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des vendeurs' })
  }
})

interface ActivateTrialRequest {
  id: string
}

// Activate vendor trial (14 days)
router.patch('/vendors/:id/activate-trial', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as unknown as ActivateTrialRequest

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID vendeur invalide' })
    }

    const trialStartDate = new Date()
    const trialEndDate = new Date()
    trialEndDate.setDate(trialStartDate.getDate() + 14)

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        status: VENDOR_STATUS.APPROVED,
        trial_start_date: trialStartDate,
        trial_end_date: trialEndDate
      }
    })

    res.json({ message: 'Période d\'essai activée (14 jours)', vendor })
  } catch (error) {
    console.error('Activate trial error:', error)
    res.status(500).json({ error: 'Erreur lors de l\'activation de la période d\'essai' })
  }
})

// Get all products (admin)
router.get('/products', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 50 } = req.query
    const where: Prisma.ProductWhereInput = {}
    if (status) {
      const statusString = String(status).toUpperCase()
      if (['ACTIVE', 'DRAFT', 'ARCHIVED'].includes(statusString)) {
        where.status = statusString as 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        vendor: { include: { user: { include: { profile: true } } } },
        category: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    })

    const total = await prisma.product.count({ where })

    res.json({
      products,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' })
  }
})

interface UpdateStatusRequest {
  id: string
}
interface UpdateStatusBody {
  status: string
}

// Update product status
router.patch('/products/:id/status', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as unknown as UpdateStatusRequest
    const { status } = req.body as UpdateStatusBody

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID produit invalide' })
    }

    if (!status || !['ACTIVE', 'DRAFT', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide. Valeurs acceptées: ACTIVE, DRAFT, ARCHIVED' })
    }

    const product = await prisma.product.update({
      where: { id },
      data: { status: status as 'ACTIVE' | 'DRAFT' | 'ARCHIVED' }
    })

    res.json({ message: 'Statut du produit mis à jour', product })
  } catch (error) {
    console.error('Update product status error:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' })
  }
})

// Get system logs (placeholder)
router.get('/logs', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // This would typically read from log files or a logging service
    res.json({
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: 'Système démarré',
          source: 'system'
        }
      ]
    })

  } catch (error) {
    console.error('Get logs error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des logs'
    })
  }
})

export default router
