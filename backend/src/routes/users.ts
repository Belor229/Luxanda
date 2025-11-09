import express from 'express'
import { body, validationResult } from 'express-validator'
import { getDB } from '../config/database'
import { authenticateToken, requireAdmin } from '../middlewares/auth'

const router = express.Router()

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId
    const db = getDB()

    const [users] = await db.execute(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = ?',
      [userId]
    )

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      })
    }

    const user = users[0] as any

    // Get user rewards if exists
    const [rewards] = await db.execute(
      'SELECT * FROM rewards WHERE user_id = ?',
      [userId]
    )

    res.json({
      user: {
        ...user,
        rewards: Array.isArray(rewards) && rewards.length > 0 ? rewards[0] : null
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
], authenticateToken, async (req, res) => {
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
    const db = getDB()

    const updateFields = []
    const values = []

    if (firstName) {
      updateFields.push('first_name = ?')
      values.push(firstName)
    }
    if (lastName) {
      updateFields.push('last_name = ?')
      values.push(lastName)
    }
    if (phone) {
      updateFields.push('phone = ?')
      values.push(phone)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'Aucune donnée à mettre à jour'
      })
    }

    values.push(userId)
    await db.execute(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    )

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
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query
    const db = getDB()

    let query = 'SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM users WHERE 1=1'
    const params: any[] = []

    if (role) {
      query += ' AND role = ?'
      params.push(role)
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY created_at DESC'

    // Add pagination
    const offset = (Number(page) - 1) * Number(limit)
    query += ' LIMIT ? OFFSET ?'
    params.push(Number(limit), offset)

    const [users] = await db.execute(query, params)

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1'
    const countParams: any[] = []

    if (role) {
      countQuery += ' AND role = ?'
      countParams.push(role)
    }

    if (search) {
      countQuery += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)'
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    const [countResult] = await db.execute(countQuery, countParams)
    const total = (countResult as any)[0]?.total || 0

    res.json({
      users: Array.isArray(users) ? users : [],
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
], authenticateToken, requireAdmin, async (req, res) => {
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
    const db = getDB()

    await db.execute(
      'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [isActive, id]
    )

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
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDB()

    // Total users
    const [totalUsers] = await db.execute('SELECT COUNT(*) as total FROM users')
    const total = (totalUsers as any)[0]?.total || 0

    // Active users
    const [activeUsers] = await db.execute('SELECT COUNT(*) as total FROM users WHERE is_active = true')
    const active = (activeUsers as any)[0]?.total || 0

    // Users by role
    const [usersByRole] = await db.execute(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `)

    // New users this month
    const [newUsers] = await db.execute(`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    `)
    const newThisMonth = (newUsers as any)[0]?.total || 0

    res.json({
      totalUsers: total,
      activeUsers: active,
      inactiveUsers: total - active,
      usersByRole: Array.isArray(usersByRole) ? usersByRole : [],
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
