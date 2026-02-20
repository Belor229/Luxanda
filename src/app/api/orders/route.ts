import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/services/orders'
import { orderCreateSchema } from '@/lib/validations'
import { z } from 'zod'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Use Zod for strict validation
        const validatedData = orderCreateSchema.parse(body)

        const order = await createOrder({
            seller_id: validatedData.seller_id,
            total_amount: validatedData.total_amount,
            shipping_address: validatedData.shipping_address,
            phone_contact: validatedData.phone_contact,
            items: validatedData.items.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }))
        })

        return NextResponse.json({ message: 'Commande créée avec succès', order }, { status: 201 })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Données de commande invalides',
                details: error.issues.map((e: z.ZodIssue) => e.message).join(', ')
            }, { status: 400 })
        }

        console.error('Create order error:', error)
        return NextResponse.json({ error: error.message || 'Erreur lors de la création de la commande' }, { status: 500 })
    }
}
