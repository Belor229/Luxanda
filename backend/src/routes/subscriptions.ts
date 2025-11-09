import express from 'express'
import { body, validationResult } from 'express-validator'
import { getDB } from '../config/database'
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
router.get('/plans', (req: any, res: any) => {
  res.json({
    plans: SUBSCRIPTION_PLANS
  })
})

// Create subscription
router.post('/create', [
  body('planType').isIn(['starter', 'pro', 'premium']),
  body('paymentMethod').isIn(['kkiapay'])
], authenticateToken, async (req: AuthRequest, res: any) => {
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
    const db = getDB()

    const plan = SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan) {
      return res.status(400).json({
        error: 'Plan d\'abonnement invalide'
      })
    }

    // Check if user already has an active subscription
    const [existingSubs] = await db.execute(
      'SELECT * FROM subscriptions WHERE user_id = ? AND status IN ("active", "pending")',
      [userId]
    )

    if (Array.isArray(existingSubs) && existingSubs.length > 0) {
      return res.status(400).json({
        error: 'Vous avez déjà un abonnement actif ou en attente'
      })
    }

    // Create subscription
    const [result] = await db.execute(
      'INSERT INTO subscriptions (user_id, plan_type, amount, payment_method, status) VALUES (?, ?, ?, ?, "pending")',
      [userId, planType, plan.price, paymentMethod]
    )

    const subscriptionId = (result as any).insertId

    // Generate payment reference
    const paymentReference = `LUX${subscriptionId}${Date.now()}`

    await db.execute(
      'UPDATE subscriptions SET payment_reference = ? WHERE id = ?',
      [paymentReference, subscriptionId]
    )

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
router.get('/my-subscriptions', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const userId = (req as any).user.userId
    const db = getDB()

    const [subscriptions] = await db.execute(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )

    res.json({
      subscriptions: Array.isArray(subscriptions) ? subscriptions : []
    })

  } catch (error) {
    console.error('Get subscriptions error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des abonnements'
    })
  }
})

// Admin: Get all subscriptions
router.get('/all', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const userRole = (req as any).user.role
    if (userRole !== 'admin') {
      return res.status(403).json({
        error: 'Accès non autorisé'
      })
    }

    const db = getDB()
    const [subscriptions] = await db.execute(`
      SELECT s.*, u.first_name, u.last_name, u.email 
      FROM subscriptions s 
      JOIN users u ON s.user_id = u.id 
      ORDER BY s.created_at DESC
    `)

    res.json({
      subscriptions: Array.isArray(subscriptions) ? subscriptions : []
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
], authenticateToken, async (req: AuthRequest, res: any) => {
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
    const db = getDB()

    // Update subscription status
    await db.execute(
      'UPDATE subscriptions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    )

    // If activating subscription, set start and end dates
    if (status === 'active') {
      const planType = await db.execute(
        'SELECT plan_type FROM subscriptions WHERE id = ?',
        [id]
      )
      
      if (Array.isArray(planType) && planType.length > 0) {
        const plan = planType[0] as any
        const duration = SUBSCRIPTION_PLANS[plan.plan_type as keyof typeof SUBSCRIPTION_PLANS]?.duration || 30
        
        await db.execute(
          'UPDATE subscriptions SET start_date = CURRENT_TIMESTAMP, end_date = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? DAY) WHERE id = ?',
          [duration, id]
        )
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
], authenticateToken, async (req: AuthRequest, res: any) => {
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
    const db = getDB()

    // Trouver l'abonnement en attente
    const [subscriptions] = await db.execute(
      'SELECT * FROM subscriptions WHERE user_id = ? AND status = "pending" ORDER BY created_at DESC LIMIT 1',
      [userId]
    )

    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return res.status(404).json({
        error: 'Aucun abonnement en attente trouvé'
      })
    }

    const subscription = subscriptions[0] as any

    // Mettre à jour l'abonnement
    await db.execute(
      'UPDATE subscriptions SET status = "active", payment_reference = ?, start_date = CURRENT_TIMESTAMP, end_date = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY) WHERE id = ?',
      [transactionId, subscription.id]
    )

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
