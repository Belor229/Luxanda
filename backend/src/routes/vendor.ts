import express, { Response } from 'express'
import { body, validationResult } from 'express-validator'
import { authenticateToken, requireVendor } from '../middlewares/auth'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../types'
import { ProductStatus } from '@prisma/client'

const router = express.Router()

// Validation middleware
const validate = (req: express.Request, res: Response, next: express.NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Données invalides', details: errors.array() })
  }
  next()
}

// Get vendor dashboard stats
router.get('/dashboard', authenticateToken, requireVendor, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId

    // Find vendor record
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    })

    if (!vendor) {
      return res.status(404).json({
        error: 'Compte vendeur non trouvé'
      })
    }

    // Get products stats
    const totalProducts = await prisma.product.count({
      where: { vendorId: vendor.id }
    })

    const activeProducts = await prisma.product.count({
      where: { vendorId: vendor.id, status: ProductStatus.ACTIVE }
    })

    const featuredProducts = await prisma.product.count({
      where: { vendorId: vendor.id, featured: true }
    })

    // Get subscription info
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        plan: true,
        status: true,
        endDate: true
      }
    })

    // Get recent products
    const productsList = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const stats = {
      products: {
        total: totalProducts,
        active: activeProducts,
        featured: featuredProducts
      },
      subscription: {
        plan: subscription?.plan || 'NONE',
        status: subscription?.status || 'INACTIVE',
        expiresAt: subscription?.endDate || null
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
router.get('/products', authenticateToken, requireVendor, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId

    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    })

    if (!vendor) {
      return res.status(404).json({
        error: 'Compte vendeur non trouvé'
      })
    }

    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' }
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
  authenticateToken,
  requireVendor,
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('description').notEmpty().withMessage('La description est requise'),
  body('price').isNumeric().withMessage('Le prix doit être un nombre'),
  body('categoryId').notEmpty().withMessage('La catégorie est requise'),
  body('quantity').isInt({ min: 0 }).withMessage('La quantité doit être un nombre positif'),
  validate
], async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, categoryId, quantity, images = [] } = req.body
    const userId = req.user!.userId

    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    })

    if (!vendor) {
      return res.status(403).json({
        error: 'Compte vendeur non trouvé'
      })
    }

    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        name,
        description,
        price: parseFloat(price),
        categoryId,
        quantity,
        images,
        status: ProductStatus.ACTIVE,
        featured: false
      }
    })

    res.status(201).json({
      message: 'Produit créé avec succès',
      product
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
  authenticateToken,
  requireVendor,
  body('name').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('price').optional().isNumeric(),
  body('categoryId').optional().notEmpty(),
  body('quantity').optional().isInt({ min: 0 }),
  validate
], async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    })

    if (!vendor) {
      return res.status(403).json({
        error: 'Compte vendeur non trouvé'
      })
    }

    // Check if product belongs to vendor
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: id,
        vendorId: vendor.id
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
    if (req.body.categoryId !== undefined) updateData.categoryId = req.body.categoryId
    if (req.body.quantity !== undefined) updateData.quantity = req.body.quantity
    if (req.body.images !== undefined) updateData.images = req.body.images

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'Aucune donnée à mettre à jour'
      })
    }

    await prisma.product.update({
      where: { id: id },
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
router.delete('/products/:id', authenticateToken, requireVendor, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    })

    if (!vendor) {
      return res.status(403).json({
        error: 'Compte vendeur non trouvé'
      })
    }

    // Check if product belongs to vendor
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: id,
        vendorId: vendor.id
      }
    })

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      })
    }

    await prisma.product.update({
      where: { id: id },
      data: { status: ProductStatus.ARCHIVED }
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
