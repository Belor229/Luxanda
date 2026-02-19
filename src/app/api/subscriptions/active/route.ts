import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client'

// Force dynamic since we use cookies
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await request.json()
        const { planPrefix, transactionId } = body

        if (!planPrefix || !transactionId) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
        }

        // Determine plan details
        let amount = 0
        let plan: SubscriptionPlan = SubscriptionPlan.STARTER

        switch (planPrefix) {
            case 'STARTER':
                amount = 5000
                plan = SubscriptionPlan.STARTER
                break
            case 'PRO':
                amount = 15000
                plan = SubscriptionPlan.PRO
                break
            case 'PREMIUM':
                amount = 30000
                plan = SubscriptionPlan.PREMIUM
                break
            default:
                return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
        }

        // Verify vendor profile existence
        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id }
        })

        if (!vendor) {
            return NextResponse.json({ error: 'Vendeur non trouvé' }, { status: 404 })
        }

        // Deactivate any existing active subscriptions for this user
        await prisma.subscription.updateMany({
            where: {
                userId: session.user.id,
                status: SubscriptionStatus.ACTIVE
            },
            data: {
                status: SubscriptionStatus.CANCELLED, // Or EXPIRED
                endDate: new Date()
            }
        })

        // Check if user has an active trial
        const existingTrial = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: SubscriptionStatus.ACTIVE,
                trialEndDate: { not: null }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Create new subscription
        const startDate = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1) // 1 month duration

        // If there's an active trial, end it and start paid subscription
        if (existingTrial && existingTrial.trialEndDate && new Date() < existingTrial.trialEndDate) {
            await prisma.subscription.update({
                where: { id: existingTrial.id },
                data: {
                    status: SubscriptionStatus.EXPIRED,
                    endDate: new Date()
                }
            })
        }

        const subscription = await prisma.subscription.create({
            data: {
                userId: session.user.id,
                plan: plan,
                amount: amount,
                status: SubscriptionStatus.ACTIVE,
                paymentRef: transactionId,
                startDate: startDate,
                endDate: endDate,
                trialEndDate: null // No trial for paid subscriptions
            }
        })

        return NextResponse.json({ success: true, subscription })

    } catch (error) {
        console.error('Subscription activation error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
