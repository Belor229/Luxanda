import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../config/prisma'
import { authenticateToken, requireAdmin } from '../middlewares/auth'

const router = express.Router()

// Get user profile
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        rewards: true
      }
    })

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        phone: user.profile?.phone,
        role: user.role,
        createdAt: user.createdAt,
        rewards: user.rewards
      }
    })

  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération du profil'
    })
  }
})

// Update user profile
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 2 }),
  body('lastName').optional().trim().isLength({ min: 2 }),
  body('phone').optional().isString()
], authenticateToken, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    const userId = (req as any).user.userId
    const { firstName, lastName, phone } = req.body

    const updateData: any = {}
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (phone) updateData.phone = phone

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'Aucune donnée à mettre à jour'
      })
    }

    await prisma.userProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData
      }
    })

    res.json({
      message: 'Profil mis à jour avec succès'
    })

  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du profil'
    })
  }
})

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query

    const where: any = {}

    if (role) {
      where.role = (role as string).toUpperCase()
    }

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { profile: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search as string, mode: 'insensitive' } } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.user.count({ where })
    ])

    res.json({
      users: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        firstName: u.profile?.firstName,
        lastName: u.profile?.lastName,
        phone: u.profile?.phone
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })

  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des utilisateurs'
    })
  }
})

// Delete user (Admin only - logical delete not in schema, so we keep as example)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await prisma.user.delete({
      where: { id }
    })

    res.json({
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      error: 'Erreur lors de la suppression de l\'utilisateur'
    })
  }
})

// Get user statistics (Admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Total users
    const total = await prisma.user.count()

    // Users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    // New users this month
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const newThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneMonthAgo
        }
      }
    })

    res.json({
      totalUsers: total,
      usersByRole: usersByRole.map((item: any) => ({
        role: item.role,
        count: item._count.role
      })),
      newUsersThisMonth: newThisMonth
    })

  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques'
    })
  }
})

export default router
