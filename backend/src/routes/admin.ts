import express, { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { authenticateToken, requireAdmin } from '../middlewares/auth'

const router = express.Router()

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
        users: recentUsers.map((user: any) => ({
          firstName: user.profile?.firstName,
          lastName: user.profile?.lastName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        })),
        products: recentProducts.map((product: any) => ({
          name: product.name,
          price: product.price,
          firstName: product.vendor?.profile?.firstName,
          lastName: product.vendor?.profile?.lastName,
          createdAt: product.createdAt
        })),
        subscriptions: recentSubscriptions.map((sub: any) => ({
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

    // Note: This assumes a ContactMessage model exists in Prisma schema
    // If not, you'll need to add it or use raw SQL with prisma.$queryRaw
    const whereClause: any = {}
    if (status) {
      whereClause.status = status
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

// Update message status
router.patch('/contact-messages/:id/status', [
  requireAdmin
], authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        error: 'Statut invalide'
      })
    }

    await prisma.contactMessage.update({
      where: { id },
      data: { status }
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
