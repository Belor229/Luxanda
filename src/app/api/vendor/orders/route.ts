import { NextRequest, NextResponse } from 'next/server'
import { getSellerOrders } from '@/lib/services/orders'

export async function GET(request: NextRequest) {
    try {
        const orders = await getSellerOrders()
        return NextResponse.json(orders)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
