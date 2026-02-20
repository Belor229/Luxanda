import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus } from '@/lib/services/orders'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const { status } = await request.json()

        if (!['confirmed', 'delivered', 'cancelled'].includes(status)) {
            return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
        }

        const order = await updateOrderStatus(id, status)
        return NextResponse.json(order)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
