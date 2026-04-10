import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { assertAdmin } from '@/lib/admin-auth'
import { z } from 'zod'
import { logAdminAction } from '@/lib/admin-logger'

export const dynamic = 'force-dynamic'

const productActionSchema = z.object({
    productId: z.string().uuid(),
    action: z.enum(['approve', 'reject', 'suspect']),
    reason: z.string().optional()
})

export async function POST(request: NextRequest) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        const gate = await assertAdmin(authUser, supabase)
        if (!gate.ok) {
            return NextResponse.json({ error: gate.message }, { status: gate.status })
        }

        const body = await request.json()
        const { productId, action, reason } = productActionSchema.parse(body)

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { vendor: true }
        })

        if (!product) {
            return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
        }

        let newStatus: any = 'ACTIVE'
        switch (action) {
            case 'approve': newStatus = 'ACTIVE'; break
            case 'reject': newStatus = 'REJECTED'; break
            case 'suspect': newStatus = 'SUSPECT'; break
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: { 
                status: newStatus,
                admin_notes: reason || `Produit ${action} par admin`
            }
        })

        // Centralized Log
        await logAdminAction(
            authUser.id,
            `PRODUCT_${action.toUpperCase()}`,
            productId,
            { reason, productName: product.name, vendorId: product.vendor_id }
        )

        return NextResponse.json({ 
            success: true, 
            product: updatedProduct,
            message: `Produit ${action} avec succès`
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 })
        }
        console.error('Admin product action error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        const gate = await assertAdmin(authUser, supabase)
        if (!gate.ok) {
            return NextResponse.json({ error: gate.message }, { status: gate.status })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const search = searchParams.get('search')?.trim()
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')

        const where: any = {}
        if (status) where.status = status
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                vendor: { include: { user: { include: { profile: true } } } },
                category: true
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        })

        const total = await prisma.product.count({ where })

        return NextResponse.json({
            products,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Admin products fetch error:', error)
        return NextResponse.json({ error: 'Erreur lors de la récupération des produits' }, { status: 500 })
    }
}
