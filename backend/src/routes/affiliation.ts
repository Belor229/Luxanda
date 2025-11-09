import express from 'express'
import { body, validationResult } from 'express-validator'
import { getDB } from '../config/database'
import { authenticateToken } from '../middlewares/auth'
import { AuthRequest } from '../types'

const router = express.Router()

// Get user's affiliation link and stats
router.get('/my-affiliation', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.userId
    const db = getDB()

    // Get user's affiliation stats
    const [affiliationStats] = await db.execute(`
      SELECT 
        COUNT(referred_id) as total_referrals,
        SUM(CASE WHEN status = 'paid' THEN commission_amount ELSE 0 END) as total_earnings,
        SUM(CASE WHEN status = 'pending' THEN commission_amount ELSE 0 END) as pending_earnings
      FROM affiliations 
      WHERE referrer_id = ?
    `, [userId])

    // Get recent referrals
    const [recentReferrals] = await db.execute(`
      SELECT 
        a.id,
        a.commission_amount,
        a.status,
        a.created_at,
        u.first_name,
        u.last_name,
        u.email
      FROM affiliations a
      JOIN users u ON a.referred_id = u.id
      WHERE a.referrer_id = ?
      ORDER BY a.created_at DESC
      LIMIT 10
    `, [userId])

    const stats = Array.isArray(affiliationStats) ? affiliationStats[0] : affiliationStats
    const referrals = Array.isArray(recentReferrals) ? recentReferrals : []

    res.json({
      affiliationLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${userId}`,
      stats: {
        totalReferrals: stats?.total_referrals || 0,
        totalEarnings: stats?.total_earnings || 0,
        pendingEarnings: stats?.pending_earnings || 0
      },
      recentReferrals: referrals
    })

  } catch (error) {
    console.error('Affiliation stats error:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques d\'affiliation' })
  }
})

// Get all referrals with pagination
router.get('/referrals', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user?.userId
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const offset = (page - 1) * limit

    const db = getDB()

    // Get referrals with pagination
    const [referrals] = await db.execute(`
      SELECT 
        a.id,
        a.commission_amount,
        a.status,
        a.created_at,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM affiliations a
      JOIN users u ON a.referred_id = u.id
      WHERE a.referrer_id = ?
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset])

    // Get total count
    const [totalCount] = await db.execute(`
      SELECT COUNT(*) as total
      FROM affiliations 
      WHERE referrer_id = ?
    `, [userId])

    const total = Array.isArray(totalCount) ? (totalCount[0] as any)?.total : 0

    res.json({
      referrals: referrals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Referrals error:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des parrainages' })
  }
})

// Create referral when someone registers with referral link
router.post('/create-referral', [
  body('referrer_id').isInt().notEmpty(),
  body('referred_id').isInt().notEmpty(),
  body('commission_rate').optional().isFloat({ min: 0, max: 100 })
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    const { referrer_id, referred_id, commission_rate = 30.00 } = req.body
    const db = getDB()

    // Check if referral already exists
    const [existingReferral] = await db.execute(
      'SELECT id FROM affiliations WHERE referrer_id = ? AND referred_id = ?',
      [referrer_id, referred_id]
    )

    if (Array.isArray(existingReferral) && existingReferral.length > 0) {
      return res.status(400).json({
        error: 'Ce parrainage existe déjà'
      })
    }

    // Create new referral
    const [result] = await db.execute(`
      INSERT INTO affiliations (referrer_id, referred_id, commission_rate, status)
      VALUES (?, ?, ?, 'pending')
    `, [referrer_id, referred_id, commission_rate])

    res.json({
      message: 'Parrainage créé avec succès',
      referralId: (result as any).insertId
    })

  } catch (error) {
    console.error('Create referral error:', error)
    res.status(500).json({
      error: 'Erreur lors de la création du parrainage'
    })
  }
})

// Update commission status (admin only)
router.put('/update-commission', [
  body('referral_id').isInt().notEmpty(),
  body('status').isIn(['pending', 'paid', 'cancelled']),
  body('commission_amount').optional().isFloat({ min: 0 })
], authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' })
    }

    const { referral_id, status, commission_amount } = req.body
    const db = getDB()

    // Update commission
    await db.execute(`
      UPDATE affiliations 
      SET status = ?, commission_amount = COALESCE(?, commission_amount)
      WHERE id = ?
    `, [status, commission_amount, referral_id])

    res.json({
      message: 'Commission mise à jour avec succès'
    })

  } catch (error) {
    console.error('Update commission error:', error)
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de la commission'
    })
  }
})

// Get all affiliations (admin only)
router.get('/all', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' })
    }

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const offset = (page - 1) * limit

    const db = getDB()

    // Get all affiliations with user details
    const [affiliations] = await db.execute(`
      SELECT 
        a.id,
        a.commission_amount,
        a.commission_rate,
        a.status,
        a.created_at,
        referrer.first_name as referrer_first_name,
        referrer.last_name as referrer_last_name,
        referrer.email as referrer_email,
        referred.first_name as referred_first_name,
        referred.last_name as referred_last_name,
        referred.email as referred_email
      FROM affiliations a
      JOIN users referrer ON a.referrer_id = referrer.id
      JOIN users referred ON a.referred_id = referred.id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset])

    // Get total count
    const [totalCount] = await db.execute('SELECT COUNT(*) as total FROM affiliations')
    const total = Array.isArray(totalCount) ? (totalCount[0] as any)?.total : 0

    res.json({
      affiliations: affiliations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('All affiliations error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des affiliations'
    })
  }
})

export default router
