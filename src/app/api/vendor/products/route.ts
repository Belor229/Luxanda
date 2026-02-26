import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Validation schema
const ProductSchema = z.object({
    name: z.string().min(2, "Le nom est trop court").max(100),
    description: z.string().min(10, "La description est trop courte").max(5000),
    price: z.number().positive("Le prix doit être supérieur à 0"),
    categoryId: z.string().uuid("Catégorie invalide"),
    quantity: z.number().int().nonnegative("La quantité ne peut pas être négative"),
    images: z.array(z.string().url()).min(1, "Au moins une image est requise").max(10),
})

import { rateLimit } from '@/lib/rate-limit'

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

        // 1. Validate data
        const validatedData = ProductSchema.safeParse({
            ...body,
            price: parseFloat(body.price),
            quantity: parseInt(body.quantity) || 0
        })

        if (!validatedData.success) {
            return NextResponse.json({
                error: 'Données invalides',
                details: validatedData.error.flatten().fieldErrors
            }, { status: 400 })
        }

        const { name, description, price, categoryId, quantity, images } = validatedData.data

        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        const userId = session.user.id

        // Check vendor status (must be APPROVED)
        const vendor = await prisma.vendor.findUnique({
            where: { userId }
        })

        if (!vendor) {
            return NextResponse.json({ error: 'Compte vendeur non trouvé' }, { status: 403 })
        }

        if (vendor.status !== 'APPROVED') {
            return NextResponse.json({ error: 'Votre compte doit être validé par un administrateur pour ajouter des produits.' }, { status: 403 })
        }

        const product = await prisma.product.create({
            data: {
                vendorId: vendor.id,
                name: name.trim(),
                description: description.trim(),
                price,
                categoryId,
                quantity,
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
