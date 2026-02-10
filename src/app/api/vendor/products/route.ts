import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        const userId = session.user.id

        const products = await prisma.product.findMany({
            where: { vendor: { userId } },
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ products })
    } catch (error) {
        console.error('Vendor products fetch error:', error)
        return NextResponse.json({ error: 'Erreur lors de la récupération des produits' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, description, price, categoryId, quantity, images = [] } = body

        if (!name || !price || !categoryId) {
            return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
        }

        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        const userId = session.user.id
        const vendor = await prisma.vendor.findUnique({
            where: { userId }
        })

        if (!vendor) {
            return NextResponse.json({ error: 'Compte vendeur non trouvé' }, { status: 403 })
        }

        const product = await prisma.product.create({
            data: {
                vendorId: vendor.id,
                name,
                description,
                price: parseFloat(price),
                categoryId,
                quantity: parseInt(quantity) || 0,
                images,
                status: 'ACTIVE',
                featured: false
            }
        })

        return NextResponse.json({ message: 'Produit créé avec succès', product }, { status: 201 })
    } catch (error) {
        console.error('Create product error:', error)
        return NextResponse.json({ error: 'Erreur lors de la création du produit' }, { status: 500 })
    }
}
