import express, { Request, Response } from 'express'
import { body, query, validationResult } from 'express-validator'
import { prisma } from '../config/prisma'
import { authenticateToken, requireVendor } from '../middlewares/auth'
import { AuthRequest } from '../types'
import { Prisma } from '@prisma/client'

const router = express.Router()

// Get all products
router.get('/', [
  query('search').optional().isString().trim().escape()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Paramètres Invalides' })
    }
    const rawSearch = req.query.search
    const querySearch = typeof rawSearch === 'string' ? rawSearch.trim() : undefined
    const category = req.query.category as string | undefined
    const featured = req.query.featured as string | undefined
    const searchQuery = querySearch && querySearch.length > 0 ? querySearch : undefined
    const pageNum = parseInt(req.query.page as string) || 1
    const limitNum = parseInt(req.query.limit as string) || 20

    const now = new Date()
    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      vendor: {
        status: 'APPROVED',
        OR: [
          { trial_end_date: { gt: now } },
          {
            user: {
              subscriptions: {
                some: {
                  status: 'ACTIVE',
                  endDate: { gt: now }
                }
              }
            }
          }
        ]
      }
    }

    if (category) {
      where.category = {
        name: category
      }
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } }
      ]
    }

    const skip = (pageNum - 1) * limitNum
    const take = limitNum

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          vendor: {
            include: {
              user: {
                include: {
                  profile: true
                }
              }
            }
          },
          category: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.product.count({ where })
    ])

    res.json({
      products: products.map((p) => ({
        ...p,
        vendorName: p.vendor?.user?.profile ? `${p.vendor.user.profile.firstName} ${p.vendor.user.profile.lastName}` : p.vendor?.storeName,
        categoryName: p.category?.name
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
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
        id: id,
        status: 'ACTIVE'
      },
      include: {
        vendor: {
          select: {
            storeName: true,
            user: {
              select: {
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    phone: true
                  }
                }
              }
            }
          }
        },
        category: true
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
  body('categoryId').notEmpty().withMessage('La catégorie est requise'),
  body('quantity').isInt({ min: 0 })
], authenticateToken, requireVendor, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    const { name, description, price, categoryId, quantity, images = [], featured = false } = req.body
    const userId = req.user!.userId

    // Find vendor by userId
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    })

    if (!vendor) {
      return res.status(403).json({
        error: 'Compte vendeur non trouvé'
      })
    }

    // Check if vendor has active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
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
        vendorId: vendor.id,
        name,
        description,
        price: Number(price),
        categoryId,
        quantity,
        images,
        featured,
        status: 'ACTIVE'
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

// Update product (Vendor only)
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('price').optional().isNumeric().isFloat({ min: 0 }),
  body('categoryId').optional().notEmpty(),
  body('quantity').optional().isInt({ min: 0 })
], authenticateToken, requireVendor, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      })
    }

    const { id } = req.params
    const userId = req.user!.userId

    // Find vendor by userId
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
        error: 'Produit non trouvé ou accès non autorisé'
      })
    }

    const updateData: Partial<{
      name: string
      description: string
      price: number
      categoryId: string
      quantity: number
      images: string[]
      featured: boolean
      status: string
    }> = {}

    if (req.body.name !== undefined) updateData.name = req.body.name
    if (req.body.description !== undefined) updateData.description = req.body.description
    if (req.body.price !== undefined) updateData.price = Number(req.body.price)
    if (req.body.categoryId !== undefined) updateData.categoryId = req.body.categoryId
    if (req.body.quantity !== undefined) updateData.quantity = Number(req.body.quantity)
    if (req.body.images !== undefined) updateData.images = req.body.images
    if (req.body.featured !== undefined) updateData.featured = req.body.featured
    if (req.body.status !== undefined) updateData.status = req.body.status

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

// Delete product (Vendor only)
router.delete('/:id', authenticateToken, requireVendor, async (req: AuthRequest, res: Response) => {
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
    const product = await prisma.product.findFirst({
      where: {
        id: id,
        vendorId: vendor.id
      }
    })

    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé ou accès non autorisé'
      })
    }

    // Physical or Logical delete based on needs, schema supports logical status
    await prisma.product.update({
      where: { id: id },
      data: { status: 'ARCHIVED' }
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
        vendorId: vendorId,
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'desc' }
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
