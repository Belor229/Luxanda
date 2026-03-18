import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../config/prisma'
import { authenticateToken } from '../middlewares/auth'
import { AuthRequest } from '../types'

const router = express.Router()

// Create new order
router.post('/', authenticateToken, [
    body('items').isArray({ min: 1 }),
    body('addressId').notEmpty().isString(),
    body('paymentMethod').notEmpty().isString(),
    body('total').isFloat({ min: 0 }),
    body('notes').optional().trim().isString().isLength({ max: 500 })
], async (req: AuthRequest, res: Response) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Données invalides', details: errors.array() })
        }

        const userId = req.user!.userId
        const { items, addressId, paymentMethod, total, notes } = req.body as {
            items: Array<{ id: string; quantity: number; price: number }>;
            addressId: string;
            paymentMethod: string;
            total: number;
            notes?: string;
        }

        const order = await prisma.order.create({
            data: {
                userId,
                addressId,
                paymentMethod,
                total: Number(total),
                subtotal: Number(total), // Simplified
                status: 'PENDING',
                paymentStatus: 'PENDING',
                notes,
                items: {
                    create: Array.isArray(items) ? items.map((item: { id: string; quantity: number; price: number }) => ({
                        productId: String(item.id),
                        quantity: Number(item.quantity) || 1,
                        price: Number(item.price) || 0,
                        total: (Number(item.price) || 0) * (Number(item.quantity) || 1)
                    })) : []
                }
            },
            include: {
                items: true
            }
        })

        res.status(201).json({ message: 'Commande créée avec succès', order })
    } catch (error) {
        console.error('Create order error:', error)
        res.status(500).json({ error: 'Erreur lors de la création de la commande' })
    }
})

// Get user orders
router.get('/my-orders', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                address: true
            },
            orderBy: { createdAt: 'desc' }
        })
        res.json({ orders })
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des commandes' })
    }
})

export default router
