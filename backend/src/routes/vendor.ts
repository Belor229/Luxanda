import express from 'express'
import { body, validationResult } from 'express-validator'
import { authenticateToken, requireVendor } from '../middlewares/auth'
import { getDB } from '../config/database'

const router = express.Router()

// Get vendor dashboard stats
router.get('/dashboard', authenticateToken, requireVendor, async (req, res) => {
  try {
    const userId = (req as any).user.userId
    const db = getDB()

    // Get products stats
    const [productsResult] = await db.execute(
      'SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active, SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured FROM products WHERE vendor_id = ?',
      [userId]
    )

    const products = Array.isArray(productsResult) ? productsResult[0] : productsResult

    // Get views stats (simplified - in real app, you'd have a views table)
    const [viewsResult] = await db.execute(
      'SELECT SUM(views) as total FROM products WHERE vendor_id = ?',
      [userId]
    )

    const views = Array.isArray(viewsResult) ? viewsResult[0] : viewsResult

    // Get subscription info
    const [subscriptionResult] = await db.execute(
      'SELECT plan_type, status, end_date FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    )

    const subscription = Array.isArray(subscriptionResult) ? subscriptionResult[0] : subscriptionResult

    // Get recent products
    const [productsList] = await db.execute(
      'SELECT id, name, price, category, is_active, is_featured, views, created_at FROM products WHERE vendor_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    )

    const stats = {
      products: {
        total: products?.total || 0,
        active: products?.active || 0,
        featured: products?.featured || 0
      },
      views: {
        total: views?.total || 0,
        thisMonth: Math.floor((views?.total || 0) * 0.3) // Simulated monthly views
      },
      subscription: {
        plan: subscription?.plan_type || 'starter',
        status: subscription?.status || 'inactive',
        expiresAt: subscription?.end_date || null
      }
    }

    res.json({
      stats,
      products: productsList || []
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des données du dashboard'
    })
  }
})

// Get vendor products
router.get('/products', authenticateToken, requireVendor, async (req, res) => {
  try {
    const userId = (req as any).user.userId
    const db = getDB()

    const [products] = await db.execute(
      'SELECT * FROM products WHERE vendor_id = ? ORDER BY created_at DESC',
      [userId]
    )

    res.json({
      products: products || []
    })

  } catch (error) {
    console.error('Products error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des produits'
    })
  }
})

// Create product
router.post('/products', [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('description').notEmpty().withMessage('La description est requise'),
  body('price').isNumeric().withMessage('Le prix doit être un nombre'),
  body('category').notEmpty().withMessage('La catégorie est requise'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('La quantité doit être un nombre positif')
], authenticateToken, requireVendor, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    const { name, description, price, category, stockQuantity, images = [] } = req.body
    const userId = (req as any).user.userId
    const db = getDB()

    const [result] = await db.execute(
      'INSERT INTO products (vendor_id, name, description, price, category, stock_quantity, images, is_active, is_featured, views, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, 0, NOW(), NOW())',
      [userId, name, description, price, category, stockQuantity, JSON.stringify(images)]
    )

    const insertResult = result as any

    res.status(201).json({
      message: 'Produit créé avec succès',
      product: {
        id: insertResult.insertId,
        name,
        description,
        price,
        category,
        stockQuantity,
        images
      }
    })

  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({
      error: 'Erreur lors de la création du produit'
    })
  }
})

// Update product
router.put('/products/:id', [
  body('name').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('price').optional().isNumeric(),
  body('category').optional().notEmpty(),
  body('stockQuantity').optional().isInt({ min: 0 })
], authenticateToken, requireVendor, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    const { id } = req.params
    const userId = (req as any).user.userId
    const db = getDB()

    // Check if product belongs to user
    const [products] = await db.execute(
      'SELECT * FROM products WHERE id = ? AND vendor_id = ?',
      [id, userId]
    )

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      })
    }

    const updateFields = []
    const updateValues = []

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        updateFields.push(`${key} = ?`)
        if (key === 'images') {
          updateValues.push(JSON.stringify(req.body[key]))
        } else {
          updateValues.push(req.body[key])
        }
      }
    })

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'Aucune donnée à mettre à jour'
      })
    }

    updateFields.push('updated_at = NOW()')
    updateValues.push(id)

    await db.execute(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    res.json({
      message: 'Produit mis à jour avec succès'
    })

  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du produit'
    })
  }
})

// Delete product
router.delete('/products/:id', authenticateToken, requireVendor, async (req, res) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.userId
    const db = getDB()

    // Check if product belongs to user
    const [products] = await db.execute(
      'SELECT * FROM products WHERE id = ? AND vendor_id = ?',
      [id, userId]
    )

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      })
    }

    await db.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    )

    res.json({
      message: 'Produit supprimé avec succès'
    })

  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({
      error: 'Erreur lors de la suppression du produit'
    })
  }
})

export default router

