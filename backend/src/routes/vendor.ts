import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { authenticateToken, requireVendor } from '../middlewares/auth'
import { prisma } from '../config/prisma'

const router = express.Router()

// Get vendor dashboard stats
router.get('/dashboard', authenticateToken, requireVendor, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId

    // Get products stats
    const totalProducts = await prisma.product.count({
      where: { vendor_id: userId }
    })

    const activeProducts = await prisma.product.count({
      where: { vendor_id: userId, is_active: true }
    })

    const featuredProducts = await prisma.product.count({
      where: { vendor_id: userId, is_featured: true }
    })

    // Get views stats (simplified - in real app, you'd have a views table)
    const productsViews = await prisma.product.aggregate({
      where: { vendor_id: userId },
      _sum: { views: true }
    })

    const totalViews = productsViews._sum.views || 0

    // Get subscription info
    const subscription = await prisma.subscription.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      select: {
        plan_type: true,
        status: true,
        end_date: true
      }
    })

    // Get recent products
    const productsList = await prisma.product.findMany({
      where: { vendor_id: userId },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        is_active: true,
        is_featured: true,
        views: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' },
      take: 10
    })

    const stats = {
      products: {
        total: totalProducts,
        active: activeProducts,
        featured: featuredProducts
      },
      views: {
        total: totalViews,
        thisMonth: Math.floor(totalViews * 0.3) // Simulated monthly views
      },
      subscription: {
        plan: subscription?.plan_type || 'starter',
        status: subscription?.status || 'inactive',
        expiresAt: subscription?.end_date || null
      }
    }

    res.json({
      stats,
      products: productsList
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des données du dashboard'
    })
  }
})

// Get vendor products
router.get('/products', authenticateToken, requireVendor, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId

    const products = await prisma.product.findMany({
      where: { vendor_id: userId },
      orderBy: { created_at: 'desc' }
    })

    res.json({
      products
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
], authenticateToken, requireVendor, async (req: Request, res: Response) => {
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

    const product = await prisma.product.create({
      data: {
        vendor_id: userId,
        name,
        description,
        price: parseFloat(price),
        category,
        stock_quantity: stockQuantity,
        images: JSON.stringify(images),
        is_active: true,
        is_featured: false,
        views: 0
      }
    })

    res.status(201).json({
      message: 'Produit créé avec succès',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stockQuantity: product.stock_quantity,
        images: JSON.parse(product.images || '[]')
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
], authenticateToken, requireVendor, async (req: Request, res: Response) => {
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

    // Check if product belongs to user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: Number(id),
        vendor_id: userId
      }
    })

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      })
    }

    const updateData: any = {}

    if (req.body.name !== undefined) updateData.name = req.body.name
    if (req.body.description !== undefined) updateData.description = req.body.description
    if (req.body.price !== undefined) updateData.price = parseFloat(req.body.price)
    if (req.body.category !== undefined) updateData.category = req.body.category
    if (req.body.stockQuantity !== undefined) updateData.stock_quantity = req.body.stockQuantity
    if (req.body.images !== undefined) updateData.images = JSON.stringify(req.body.images)

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'Aucune donnée à mettre à jour'
      })
    }

    updateData.updated_at = new Date()

    await prisma.product.update({
      where: { id: Number(id) },
      data: updateData
    })

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
router.delete('/products/:id', authenticateToken, requireVendor, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.userId

    // Check if product belongs to user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: Number(id),
        vendor_id: userId
      }
    })

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      })
    }

    await prisma.product.delete({
      where: { id: Number(id) }
    })

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

