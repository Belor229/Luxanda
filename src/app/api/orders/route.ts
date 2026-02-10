import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { items, addressId, paymentMethod, total, notes } = body

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
        }

        if (!addressId || !paymentMethod) {
            return NextResponse.json({ error: 'Informations de livraison ou de paiement manquantes' }, { status: 400 })
        }

        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        const userId = session.user.id

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
                    create: items.map((item: any) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.price * item.quantity
                    }))
                }
            },
            include: {
                items: true
            }
        })

        return NextResponse.json({ message: 'Commande créée avec succès', order }, { status: 201 })
    } catch (error) {
        console.error('Create order error:', error)
        return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 })
    }
}
