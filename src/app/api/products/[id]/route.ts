import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// Force dynamic since we use cookies
export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: {
                vendor: {
                    select: { storeName: true, userId: true }
                },
                category: {
                    select: { name: true }
                },
                variants: true
            }
        })

        if (!product) {
            return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error('Product API error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // Check role
        const { data: userProfile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

        const role = userProfile?.role?.toUpperCase()

        if (role !== 'VENDOR' && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
        }

        const body = await request.json()

        // If Vendor, check if they own the product and if their status is APPROVED and trial not expired
        if (role === 'VENDOR') {
            const vendor = await prisma.vendor.findUnique({
                where: { userId: session.user.id }
            })

            if (!vendor || vendor.status !== 'APPROVED') {
                return NextResponse.json({ error: 'Votre compte doit être approuvé pour modifier des produits.' }, { status: 403 })
            }

            if (!vendor.trial_end_date || new Date(vendor.trial_end_date) < new Date()) {
                return NextResponse.json({ error: 'Votre période d\'essai a expiré.' }, { status: 403 })
            }

            const product = await prisma.product.findUnique({
                where: { id: params.id },
                include: { vendor: true }
            })

            if (!product || product.vendor.userId !== session.user.id) {
                return NextResponse.json({ error: 'Produit non trouvé ou accès refusé.' }, { status: 404 })
            }
        }

        // Validation - Basic price check
        if (body.price !== undefined && parseFloat(body.price) <= 0) {
            return NextResponse.json({ error: 'Le prix doit être supérieur à 0' }, { status: 400 })
        }

        // Update product
        const updatedProduct = await prisma.product.update({
            where: { id: params.id },
            data: {
                name: body.name,
                description: body.description,
                price: body.price ? parseFloat(body.price) : undefined,
                categoryId: body.categoryId,
                images: body.images,
                quantity: body.quantity ? parseInt(body.quantity) : undefined,
                status: body.status, // e.g. ACTIVE, DRAFT, ARCHIVED
                featured: role === 'ADMIN' ? body.featured : undefined // Only admin can feature?
            }
        })

        return NextResponse.json(updatedProduct)
    } catch (error) {
        console.error('Update product API error:', error)
        return NextResponse.json({ error: 'Erreur lors de la modification du produit' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // Check role
        const { data: userProfile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

        const role = userProfile?.role?.toUpperCase()

        if (role !== 'VENDOR' && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
        }

        // If Vendor, check if they own the product and if their status is APPROVED
        if (role === 'VENDOR') {
            const vendor = await prisma.vendor.findUnique({
                where: { userId: session.user.id }
            })

            if (!vendor || vendor.status !== 'APPROVED') {
                return NextResponse.json({ error: 'Action non autorisée.' }, { status: 403 })
            }

            const product = await prisma.product.findUnique({
                where: { id: params.id },
                include: { vendor: true }
            })

            if (!product || product.vendor.userId !== session.user.id) {
                return NextResponse.json({ error: 'Produit non trouvé ou accès refusé.' }, { status: 404 })
            }
        }

        await prisma.product.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete product API error:', error)
        return NextResponse.json({ error: 'Erreur lors de la suppression du produit' }, { status: 500 })
    }
}
