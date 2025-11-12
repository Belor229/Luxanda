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
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        created_at: true
      }
    })

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      })
    }

    // Get user rewards if exists
    const rewards = await prisma.reward.findUnique({
      where: { user_id: userId }
    })

    res.json({
      user: {
        ...user,
        rewards
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
  body('phone').optional().isMobilePhone('fr-FR')
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

    if (firstName) updateData.first_name = firstName
    if (lastName) updateData.last_name = lastName
    if (phone) updateData.phone = phone

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'Aucune donnée à mettre à jour'
      })
    }

    updateData.updated_at = new Date()

    await prisma.user.update({
      where: { id: userId },
      data: updateData
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
      where.role = role
    }

    if (search) {
      where.OR = [
        { first_name: { contains: search } },
        { last_name: { contains: search } },
        { email: { contains: search } }
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
          first_name: true,
          last_name: true,
          phone: true,
          role: true,
          is_active: true,
          created_at: true
        },
        orderBy: { created_at: 'desc' },
        skip,
        take
      }),
      prisma.user.count({ where })
    ])

    res.json({
      users,
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

// Update user status (Admin only)
router.patch('/:id/status', [
  body('isActive').isBoolean()
], authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    const { id } = req.params
    const { isActive } = req.body

    await prisma.user.update({
      where: { id: Number(id) },
      data: {
        is_active: isActive,
        updated_at: new Date()
      }
    })

    res.json({
      message: 'Statut de l\'utilisateur mis à jour avec succès'
    })

  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du statut'
    })
  }
})

// Get user statistics (Admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Total users
    const total = await prisma.user.count()

    // Active users
    const active = await prisma.user.count({
      where: { is_active: true }
    })

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
        created_at: {
          gte: oneMonthAgo
        }
      }
    })

    res.json({
      totalUsers: total,
      activeUsers: active,
      inactiveUsers: total - active,
      usersByRole: usersByRole.map(item => ({
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
