import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

const SUBSCRIPTION_PLANS = {
  STARTER: { price: 5000 },
  PRO: { price: 15000 },
  PREMIUM: { price: 30000 }
}

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json()
    const planKey = plan?.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS

    if (!SUBSCRIPTION_PLANS[planKey]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Need prisma to get vendor
    const { prisma } = await import('@/lib/prisma')
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    })


    // Check if user already has an active subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('userId', session.user.id)
      .eq('status', 'ACTIVE')
      .single()

    if (existingSub) {
      return NextResponse.json({ error: 'Vous avez déjà un abonnement actif' }, { status: 400 })
    }

    // Upsert a PENDING subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .upsert({
        userId: session.user.id,
        vendorId: vendor?.id || null,
        plan: planKey,
        amount: SUBSCRIPTION_PLANS[planKey].price,
        status: 'PENDING',
        updatedAt: new Date().toISOString()
      }, { onConflict: 'userId' }) // Only one subscription entry per user for now
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      subscription,
      vendorId: vendor?.id || null
    })
  } catch (error) {
    console.error('Create Subscription Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}
