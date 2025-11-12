import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../config/prisma'
import { authenticateToken } from '../middlewares/auth'
import { AuthRequest } from '../types'

const router = express.Router()

// Subscription plans
const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price: 5000,
    duration: 30,
    features: ['Jusqu\'à 50 produits', 'Support email', 'Statistiques de base']
  },
  pro: {
    name: 'Pro',
    price: 15000,
    duration: 30,
    features: ['Produits illimités', 'Support prioritaire', 'Analytics avancés', 'Mise en avant']
  },
  premium: {
    name: 'Premium',
    price: 30000,
    duration: 30,
    features: ['Tout de Pro', 'Support téléphonique', 'Formation personnalisée', 'Affiliation']
  }
}

// Get subscription plans
router.get('/plans', (req: Request, res: Response): void => {
  res.json({
    plans: SUBSCRIPTION_PLANS
  })
})

// Create subscription
router.post('/create', [
  body('planType').isIn(['starter', 'pro', 'premium']),
  body('paymentMethod').isIn(['kkiapay'])
], authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    const { planType, paymentMethod } = (req as any).body
    const userId = (req as any).user.userId

    const plan = SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan) {
      return res.status(400).json({
        error: 'Plan d\'abonnement invalide'
      })
    }

    // Check if user already has an active subscription
    const existingSubs = await prisma.subscription.findFirst({
      where: {
        user_id: userId,
        status: {
          in: ['active', 'pending']
        }
      }
    })

    if (existingSubs) {
      return res.status(400).json({
        error: 'Vous avez déjà un abonnement actif ou en attente'
      })
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        user_id: userId,
        plan_type: planType,
        amount: plan.price,
        payment_method: paymentMethod,
        status: 'pending'
      }
    })

    const subscriptionId = subscription.id

    // Generate payment reference
    const paymentReference = `LUX${subscriptionId}${Date.now()}`

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { payment_reference: paymentReference }
    })

    res.json({
      message: 'Abonnement créé avec succès',
      subscription: {
        id: subscriptionId,
        planType,
        amount: plan.price,
        paymentReference,
        status: 'pending'
      },
      paymentInstructions: {
        method: paymentMethod,
        amount: plan.price,
        reference: paymentReference,
        message: 'Redirection vers Kkiapay pour le paiement sécurisé.'
      }
    })

  } catch (error) {
    console.error('Subscription creation error:', error)
    res.status(500).json({
      error: 'Erreur lors de la création de l\'abonnement'
    })
  }
})

// Get user subscriptions
router.get('/my-subscriptions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.userId

    const subscriptions = await prisma.subscription.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    })

    res.json({
      subscriptions
    })

  } catch (error) {
    console.error('Get subscriptions error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des abonnements'
    })
  }
})

// Admin: Get all subscriptions
router.get('/all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = (req as any).user.role
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: 'Accès non autorisé'
      })
    }

    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    res.json({
      subscriptions
    })

  } catch (error) {
    console.error('Get all subscriptions error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des abonnements'
    })
  }
})

// Admin: Update subscription status
router.patch('/:id/status', [
  body('status').isIn(['pending', 'active', 'expired', 'cancelled'])
], authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = (req as any).user.role
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: 'Accès non autorisé'
      })
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    const { id } = (req as any).params
    const { status } = (req as any).body

    // Update subscription status
    await prisma.subscription.update({
      where: { id: Number(id) },
      data: {
        status,
        updated_at: new Date()
      }
    })

    // If activating subscription, set start and end dates
    if (status === 'active') {
      const subscription = await prisma.subscription.findUnique({
        where: { id: Number(id) }
      })

      if (subscription) {
        const duration = SUBSCRIPTION_PLANS[subscription.plan_type as keyof typeof SUBSCRIPTION_PLANS]?.duration || 30
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(startDate.getDate() + duration)

        await prisma.subscription.update({
          where: { id: Number(id) },
          data: {
            start_date: startDate,
            end_date: endDate
          }
        })
      }
    }

    res.json({
      message: 'Statut de l\'abonnement mis à jour avec succès'
    })

  } catch (error) {
    console.error('Update subscription status error:', error)
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du statut'
    })
  }
})

// Confirm payment (Kkiapay callback)
router.post('/confirm-payment', [
  body('transactionId').notEmpty(),
  body('amount').isNumeric(),
  body('reference').optional(),
  body('paymentMethod').isIn(['kkiapay'])
], authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    const { transactionId, amount, reference, paymentMethod } = (req as any).body
    const userId = (req as any).user.userId

    // Trouver l'abonnement en attente
    const subscription = await prisma.subscription.findFirst({
      where: {
        user_id: userId,
        status: 'pending'
      },
      orderBy: { created_at: 'desc' }
    })

    if (!subscription) {
      return res.status(404).json({
        error: 'Aucun abonnement en attente trouvé'
      })
    }

    // Mettre à jour l'abonnement
    const duration = SUBSCRIPTION_PLANS[subscription.plan_type as keyof typeof SUBSCRIPTION_PLANS]?.duration || 30
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + duration)

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        payment_reference: transactionId,
        start_date: startDate,
        end_date: endDate
      }
    })

    res.json({
      message: 'Paiement confirmé avec succès',
      subscription: {
        id: subscription.id,
        planType: subscription.plan_type,
        status: 'active'
      }
    })

  } catch (error) {
    console.error('Confirm payment error:', error)
    res.status(500).json({
      error: 'Erreur lors de la confirmation du paiement'
    })
  }
})

export default router
