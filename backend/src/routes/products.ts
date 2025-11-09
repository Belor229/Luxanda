import express from 'express'
import { body, validationResult } from 'express-validator'
import { getDB } from '../config/database'
import { authenticateToken, requireVendor } from '../middlewares/auth'

const router = express.Router()

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit = 20 } = req.query
    const db = getDB()
    
    let query = `
      SELECT p.*, u.first_name, u.last_name, u.email as vendor_email
      FROM products p
      JOIN users u ON p.vendor_id = u.id
      WHERE p.is_active = true
    `
    const params: any[] = []

    if (category) {
      query += ' AND p.category = ?'
      params.push(category)
    }

    if (featured === 'true') {
      query += ' AND p.is_featured = true'
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY p.created_at DESC'

    // Add pagination
    const offset = (Number(page) - 1) * Number(limit)
    query += ' LIMIT ? OFFSET ?'
    params.push(Number(limit), offset)

    const [products] = await db.execute(query, params)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE p.is_active = true'
    const countParams: any[] = []

    if (category) {
      countQuery += ' AND p.category = ?'
      countParams.push(category)
    }

    if (featured === 'true') {
      countQuery += ' AND p.is_featured = true'
    }

    if (search) {
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)'
      countParams.push(`%${search}%`, `%${search}%`)
    }

    const [countResult] = await db.execute(countQuery, countParams)
    const total = (countResult as any)[0]?.total || 0

    res.json({
      products: Array.isArray(products) ? products : [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })

  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des produits'
    })
  }
})

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = getDB()

    const [products] = await db.execute(`
      SELECT p.*, u.first_name, u.last_name, u.email as vendor_email, u.phone as vendor_phone
      FROM products p
      JOIN users u ON p.vendor_id = u.id
      WHERE p.id = ? AND p.is_active = true
    `, [id])

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      })
    }

    res.json({
      product: products[0]
    })

  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération du produit'
    })
  }
})

// Create product (Vendor only)
router.post('/', [
  body('name').trim().isLength({ min: 2 }),
  body('description').trim().isLength({ min: 10 }),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('category').trim().isLength({ min: 2 }),
  body('stockQuantity').isInt({ min: 0 })
], authenticateToken, requireVendor, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    const { name, description, price, category, stockQuantity, images = [], isFeatured = false } = req.body
    const vendorId = (req as any).user.userId
    const db = getDB()

    // Check if vendor has active subscription
    const [subscriptions] = await db.execute(
      'SELECT * FROM subscriptions WHERE user_id = ? AND status = "active" AND end_date > NOW()',
      [vendorId]
    )

    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return res.status(403).json({
        error: 'Abonnement actif requis pour publier des produits'
      })
    }

    const [result] = await db.execute(
      'INSERT INTO products (vendor_id, name, description, price, category, stock_quantity, images, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [vendorId, name, description, price, category, stockQuantity, JSON.stringify(images), isFeatured]
    )

    res.status(201).json({
      message: 'Produit créé avec succès',
      product: {
        id: (result as any).insertId,
        name,
        description,
        price,
        category,
        stockQuantity,
        images,
        isFeatured
      }
    })

  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({
      error: 'Erreur lors de la création du produit'
    })
  }
})

// Update product (Vendor only)
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('price').optional().isNumeric().isFloat({ min: 0 }),
  body('category').optional().trim().isLength({ min: 2 }),
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
    const vendorId = (req as any).user.userId
    const db = getDB()

    // Check if product belongs to vendor
    const [products] = await db.execute(
      'SELECT * FROM products WHERE id = ? AND vendor_id = ?',
      [id, vendorId]
    )

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(404).json({
        error: 'Produit non trouvé ou accès non autorisé'
      })
    }

    const updateFields = []
    const values = []

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        updateFields.push(`${key} = ?`)
        values.push(key === 'images' ? JSON.stringify(req.body[key]) : req.body[key])
      }
    })

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'Aucune donnée à mettre à jour'
      })
    }

    values.push(id)
    await db.execute(
      `UPDATE products SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
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

// Delete product (Vendor only)
router.delete('/:id', authenticateToken, requireVendor, async (req, res) => {
  try {
    const { id } = req.params
    const vendorId = (req as any).user.userId
    const db = getDB()

    // Check if product belongs to vendor
    const [products] = await db.execute(
      'SELECT * FROM products WHERE id = ? AND vendor_id = ?',
      [id, vendorId]
    )

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(404).json({
        error: 'Produit non trouvé ou accès non autorisé'
      })
    }

    await db.execute(
      'UPDATE products SET is_active = false WHERE id = ?',
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

// Get vendor products
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params
    const db = getDB()

    const [products] = await db.execute(
      'SELECT * FROM products WHERE vendor_id = ? AND is_active = true ORDER BY created_at DESC',
      [vendorId]
    )

    res.json({
      products: Array.isArray(products) ? products : []
    })

  } catch (error) {
    console.error('Get vendor products error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des produits du vendeur'
    })
  }
})

export default router
