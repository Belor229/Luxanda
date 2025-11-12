import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../config/prisma'
import { authenticateToken, requireVendor } from '../middlewares/auth'

const router = express.Router()

// Get all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, featured, search, page = 1, limit = 20 } = req.query

    const where: any = {
      is_active: true
    }

    if (category) {
      where.category = category
    }

    if (featured === 'true') {
      where.is_featured = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          vendor: {
            select: {
              first_name: true,
              last_name: true,
              email: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take
      }),
      prisma.product.count({ where })
    ])

    res.json({
      products,
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
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findFirst({
      where: {
        id: Number(id),
        is_active: true
      },
      include: {
        vendor: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      })
    }

    res.json({
      product
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
], authenticateToken, requireVendor, async (req: Request, res: Response) => {
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

    // Check if vendor has active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        user_id: vendorId,
        status: 'active',
        end_date: {
          gt: new Date()
        }
      }
    })

    if (!subscription) {
      return res.status(403).json({
        error: 'Abonnement actif requis pour publier des produits'
      })
    }

    const product = await prisma.product.create({
      data: {
        vendor_id: vendorId,
        name,
        description,
        price: Number(price),
        category,
        stock_quantity: stockQuantity,
        images: JSON.stringify(images),
        is_featured: isFeatured
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
        images: JSON.parse(product.images || '[]'),
        isFeatured: product.is_featured
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
    const vendorId = (req as any).user.userId

    // Check if product belongs to vendor
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: Number(id),
        vendor_id: vendorId
      }
    })

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Produit non trouvé ou accès non autorisé'
      })
    }

    const updateData: any = {}

    if (req.body.name !== undefined) updateData.name = req.body.name
    if (req.body.description !== undefined) updateData.description = req.body.description
    if (req.body.price !== undefined) updateData.price = Number(req.body.price)
    if (req.body.category !== undefined) updateData.category = req.body.category
    if (req.body.stockQuantity !== undefined) updateData.stock_quantity = req.body.stockQuantity
    if (req.body.images !== undefined) updateData.images = JSON.stringify(req.body.images)
    if (req.body.isFeatured !== undefined) updateData.is_featured = req.body.isFeatured

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'Aucune donnée à mettre à jour'
      })
    }

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

// Delete product (Vendor only)
router.delete('/:id', authenticateToken, requireVendor, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const vendorId = (req as any).user.userId

    // Check if product belongs to vendor
    const product = await prisma.product.findFirst({
      where: {
        id: Number(id),
        vendor_id: vendorId
      }
    })

    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé ou accès non autorisé'
      })
    }

    await prisma.product.update({
      where: { id: Number(id) },
      data: { is_active: false }
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

// Get vendor products
router.get('/vendor/:vendorId', async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params

    const products = await prisma.product.findMany({
      where: {
        vendor_id: Number(vendorId),
        is_active: true
      },
      orderBy: { created_at: 'desc' }
    })

    res.json({
      products
    })

  } catch (error) {
    console.error('Get vendor products error:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des produits du vendeur'
    })
  }
})

export default router
