import express, { Response } from 'express'
import { body, query, validationResult } from 'express-validator'
import { prisma } from '../config/prisma'
import { authenticateToken } from '../middlewares/auth'
import { AuthRequest } from '../types'
import { ReferralStatus } from '@prisma/client'

const router = express.Router()

// Validation middleware
const validate = (req: express.Request, res: Response, next: express.NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Données invalides', details: errors.array() })
  }
  next()
}

// Get user's affiliation link and stats
router.get('/my-affiliation', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId

    // Get user's affiliation stats using Prisma
    const affiliationStats = await prisma.referral.aggregate({
      where: { referrerId: userId },
      _count: { referredId: true },
      _sum: {
        commission: true
      }
    })

    // Get recent referrals using Prisma
    const recentReferrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const stats = affiliationStats
    const referrals = recentReferrals.map((ref) => ({
      id: ref.id,
      commission_amount: ref.commission,
      status: ref.status,
      created_at: ref.createdAt,
      first_name: ref.referred.profile?.firstName,
      last_name: ref.referred.profile?.lastName,
      email: ref.referred.email
    }))

    res.json({
      affiliationLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${userId}`,
      stats: {
        totalReferrals: stats._count?.referredId || 0,
        totalEarnings: stats._sum?.commission || 0,
        pendingEarnings: 0 // TODO: Calculate pending earnings separately
      },
      recentReferrals: referrals
    })

  } catch (error) {
    console.error('Affiliation stats error:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques d\'affiliation' })
  }
})

// Get all referrals with pagination
router.get('/referrals', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate
], async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { page = 1, limit = 20 } = req.query as any

    // Get referrals with pagination using Prisma
    const [referrals, totalCount] = await Promise.all([
      prisma.referral.findMany({
        where: { referrerId: userId },
        include: {
          referred: {
            include: {
              profile: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.referral.count({
        where: { referrerId: userId }
      })
    ])

    const formattedReferrals = referrals.map((ref) => ({
      id: ref.id,
      commission_amount: ref.commission,
      status: ref.status,
      created_at: ref.createdAt,
      first_name: ref.referred.profile?.firstName,
      last_name: ref.referred.profile?.lastName,
      email: ref.referred.email,
      phone: ref.referred.profile?.phone
    }))

    res.json({
      referrals: formattedReferrals,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Referrals error:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des parrainages' })
  }
})

// Create referral when someone registers with referral link
router.post('/create-referral', [
  body('referrer_id').isString().notEmpty(),
  body('referred_id').isString().notEmpty(),
  body('commission_rate').optional().isFloat({ min: 0, max: 100 }),
  validate
], async (req: express.Request, res: Response) => {
  try {
    const { referrer_id, referred_id, commission_rate = 30.00 } = req.body

    // Check if referral already exists using Prisma
    const existingReferral = await prisma.referral.findUnique({
      where: {
        referrerId_referredId: {
          referrerId: referrer_id,
          referredId: referred_id
        }
      }
    })

    if (existingReferral) {
      return res.status(400).json({
        error: 'Ce parrainage existe déjà'
      })
    }

    // Create new referral using Prisma
    const newReferral = await prisma.referral.create({
      data: {
        referrerId: referrer_id,
        referredId: referred_id,
        commission: commission_rate,
        status: ReferralStatus.PENDING
      }
    })

    res.json({
      message: 'Parrainage créé avec succès',
      referralId: newReferral.id
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
  authenticateToken,
  body('referral_id').isString().notEmpty(),
  body('status').isIn(['PENDING', 'PAID', 'CANCELLED']),
  body('commission_amount').optional().isFloat({ min: 0 }),
  validate
], async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès non autorisé' })
    }

    const { referral_id, status, commission_amount } = req.body

    // Update commission using Prisma
    await prisma.referral.update({
      where: { id: referral_id },
      data: {
        status: status as ReferralStatus,
        ...(commission_amount !== undefined && { commission: commission_amount })
      }
    })

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
router.get('/all', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate
], async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès non autorisé' })
    }

    const { page = 1, limit = 20 } = req.query as any

    // Get all affiliations with user details using Prisma
    const [affiliations, totalCount] = await Promise.all([
      prisma.referral.findMany({
        include: {
          referrer: {
            include: { profile: true }
          },
          referred: {
            include: { profile: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.referral.count()
    ])

    const formattedAffiliations = affiliations.map((affiliation) => ({
      id: affiliation.id,
      commission_amount: affiliation.commission,
      commission_rate: affiliation.commission,
      status: affiliation.status,
      created_at: affiliation.createdAt,
      referrer_first_name: affiliation.referrer.profile?.firstName,
      referrer_last_name: affiliation.referrer.profile?.lastName,
      referrer_email: affiliation.referrer.email,
      referred_first_name: affiliation.referred.profile?.firstName,
      referred_last_name: affiliation.referred.profile?.lastName,
      referred_email: affiliation.referred.email
    }))

    res.json({
      affiliations: formattedAffiliations,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
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
