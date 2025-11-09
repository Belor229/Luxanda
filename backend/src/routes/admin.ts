import express from 'express'
import { getDB } from '../config/database'
import { authenticateToken, requireAdmin } from '../middlewares/auth'

const router = express.Router()

// Admin dashboard stats
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDB()

    // Users stats
    const [totalUsers] = await db.execute('SELECT COUNT(*) as total FROM users')
    const [activeUsers] = await db.execute('SELECT COUNT(*) as total FROM users WHERE is_active = true')
    const [vendors] = await db.execute('SELECT COUNT(*) as total FROM users WHERE role = "vendor"')

    // Products stats
    const [totalProducts] = await db.execute('SELECT COUNT(*) as total FROM products')
    const [activeProducts] = await db.execute('SELECT COUNT(*) as total FROM products WHERE is_active = true')
    const [featuredProducts] = await db.execute('SELECT COUNT(*) as total FROM products WHERE is_featured = true')

    // Subscriptions stats
    const [totalSubscriptions] = await db.execute('SELECT COUNT(*) as total FROM subscriptions')
    const [activeSubscriptions] = await db.execute('SELECT COUNT(*) as total FROM subscriptions WHERE status = "active"')
    const [pendingSubscriptions] = await db.execute('SELECT COUNT(*) as total FROM subscriptions WHERE status = "pending"')

    // Revenue stats
    const [totalRevenue] = await db.execute(`
      SELECT SUM(amount) as total 
      FROM subscriptions 
      WHERE status = "active" AND start_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    `)

    // Recent activities
    const [recentUsers] = await db.execute(`
      SELECT first_name, last_name, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `)

    const [recentProducts] = await db.execute(`
      SELECT p.name, p.price, u.first_name, u.last_name, p.created_at 
      FROM products p 
      JOIN users u ON p.vendor_id = u.id 
      ORDER BY p.created_at DESC 
      LIMIT 5
    `)

    const [recentSubscriptions] = await db.execute(`
      SELECT s.plan_type, s.amount, s.status, u.first_name, u.last_name, s.created_at 
      FROM subscriptions s 
      JOIN users u ON s.user_id = u.id 
      ORDER BY s.created_at DESC 
      LIMIT 5
    `)

    res.json({
      stats: {
        users: {
          total: (totalUsers as any)[0]?.total || 0,
          active: (activeUsers as any)[0]?.total || 0,
          vendors: (vendors as any)[0]?.total || 0
        },
        products: {
          total: (totalProducts as any)[0]?.total || 0,
          active: (activeProducts as any)[0]?.total || 0,
          featured: (featuredProducts as any)[0]?.total || 0
        },
        subscriptions: {
          total: (totalSubscriptions as any)[0]?.total || 0,
          active: (activeSubscriptions as any)[0]?.total || 0,
          pending: (pendingSubscriptions as any)[0]?.total || 0
        },
        revenue: {
          thisMonth: (totalRevenue as any)[0]?.total || 0
        }
      },
      recentActivities: {
        users: Array.isArray(recentUsers) ? recentUsers : [],
        products: Array.isArray(recentProducts) ? recentProducts : [],
        subscriptions: Array.isArray(recentSubscriptions) ? recentSubscriptions : []
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
router.get('/contact-messages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const db = getDB()

    let query = 'SELECT * FROM contact_messages WHERE 1=1'
    const params: any[] = []

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ' ORDER BY created_at DESC'

    // Add pagination
    const offset = (Number(page) - 1) * Number(limit)
    query += ' LIMIT ? OFFSET ?'
    params.push(Number(limit), offset)

    const [messages] = await db.execute(query, params)

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM contact_messages WHERE 1=1'
    const countParams: any[] = []

    if (status) {
      countQuery += ' AND status = ?'
      countParams.push(status)
    }

    const [countResult] = await db.execute(countQuery, countParams)
    const total = (countResult as any)[0]?.total || 0

    res.json({
      messages: Array.isArray(messages) ? messages : [],
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
], authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const db = getDB()

    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        error: 'Statut invalide'
      })
    }

    await db.execute(
      'UPDATE contact_messages SET status = ? WHERE id = ?',
      [status, id]
    )

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
router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
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
