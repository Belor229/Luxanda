import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client'

// Force dynamic since we use cookies
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const supabase = createClient(Promise.resolve(cookieStore) as any)

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await request.json()

        // Check if user already has a vendor profile
        const existingVendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id }
        })

        if (existingVendor) {
            return NextResponse.json({ error: 'Profil vendeur déjà existant.' }, { status: 400 })
        }

        // Create vendor profile
        const vendor = await prisma.vendor.create({
            data: {
                userId: session.user.id,
                storeName: body.storeName,
                description: body.description,
                status: 'PENDING'
            }
        })

        // Create automatic 2-month trial subscription for new vendors
        const trialStartDate = new Date()
        const trialEndDate = new Date()
        trialEndDate.setMonth(trialEndDate.getMonth() + 2) // 2 months free trial

        await prisma.subscription.create({
            data: {
                userId: session.user.id,
                plan: SubscriptionPlan.STARTER, // Default plan for trial
                amount: 0, // Free during trial
                status: SubscriptionStatus.ACTIVE,
                startDate: trialStartDate,
                trialEndDate: trialEndDate,
                endDate: trialEndDate // Trial ends after 2 months
            }
        })

        return NextResponse.json(vendor)
    } catch (error) {
        console.error('Create vendor API error:', error)
        return NextResponse.json({ error: 'Erreur lors de la création du profil vendeur' }, { status: 500 })
    }
}

export async function GET(_request: Request) {
    try {
        const cookieStore = await cookies()
        const supabase = createClient(Promise.resolve(cookieStore) as any)

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
            include: {
                products: {
                    select: { id: true, name: true, price: true, status: true, quantity: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!vendor) {
            return NextResponse.json({ error: 'Vendeur non trouvé' }, { status: 404 })
        }

        return NextResponse.json(vendor)
    } catch (error) {
        console.error('Get vendor API error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies()
        const supabase = createClient(Promise.resolve(cookieStore) as any)

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await request.json()

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id }
        })

        if (!vendor) {
            return NextResponse.json({ error: 'Profil vendeur introuvable.' }, { status: 404 })
        }

        const updatedVendor = await prisma.vendor.update({
            where: { id: vendor.id },
            data: {
                storeName: body.storeName,
                description: body.description,
                // Status update is reserved for Admin
            }
        })

        return NextResponse.json(updatedVendor)
    } catch (error) {
        console.error('Update vendor API error:', error)
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 })
    }
}
