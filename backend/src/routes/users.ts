import express, { Request, Response } from 'express'
import { body, query, validationResult } from 'express-validator'
import { prisma } from '../config/prisma'
import { authenticateToken, requireAdmin } from '../middlewares/auth'
import { AuthRequest } from '../types'
import { Prisma } from '@prisma/client'

const router = express.Router()

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId

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
], authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    const userId = req.user!.userId
    const { firstName, lastName, phone } = req.body

    const updateData: Partial<{ firstName: string; lastName: string; phone: string }> = {}
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
router.get('/', [
  query('search').optional().isString().trim().escape(),
  query('role').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 })
], authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Paramètres Invalides' })
    }
    const rawSearch = req.query.search
    const querySearch = typeof rawSearch === 'string' ? rawSearch.trim() : undefined
    const searchQuery = querySearch && querySearch.length > 0 ? querySearch : undefined
    const roleQuery = typeof req.query.role === 'string' ? req.query.role : undefined
    const pageNum = parseInt(req.query.page as string) || 1
    const limitNum = parseInt(req.query.limit as string) || 20

    const where: Prisma.UserWhereInput = {}

    if (roleQuery) {
      where.role = roleQuery.toUpperCase()
    }

    if (searchQuery) {
      where.OR = [
        { email: { contains: searchQuery, mode: 'insensitive' } },
        { profile: { firstName: { contains: searchQuery, mode: 'insensitive' } } },
        { profile: { lastName: { contains: searchQuery, mode: 'insensitive' } } }
      ]
    }

    const skip = (pageNum - 1) * limitNum
    const take = limitNum

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
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        firstName: u.profile?.firstName,
        lastName: u.profile?.lastName,
        phone: u.profile?.phone
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
      usersByRole: usersByRole.map((item) => ({
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
