import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// Interface pour les plans d'abonnement
interface SubscriptionPlan {
  name: string
  price: number
  duration: number // en mois
  features: string[]
}

const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  STARTER: {
    name: 'Starter',
    price: 5000,
    duration: 1,
    features: ['20 produits', 'Support email', 'Statistiques de base']
  },
  PRO: {
    name: 'Business Pro',
    price: 15000,
    duration: 1,
    features: ['Produits illimités', 'Mise en avant mensuelle', 'Analytics avancés', 'Support 7j/7']
  },
  PREMIUM: {
    name: 'Luxe Premium',
    price: 30000,
    duration: 1,
    features: ['Tout de Business Pro', 'Mise en avant prioritaire', 'Boutique personnalisée', 'Support VIP']
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le vendeur et son abonnement actuel
    const { data: vendor } = await supabase
      .from('vendors')
      .select(`
        *,
        subscription:subscriptions(*)
      `)
      .eq('user_id', user.id)
      .single()

    if (!vendor) {
      return NextResponse.json({ error: 'Vendeur non trouvé' }, { status: 404 })
    }

    // Vérifier si l'abonnement est actif
    const isActive = vendor.subscription?.status === 'ACTIVE' && 
                   new Date(vendor.subscription.end_date) > new Date()

    return NextResponse.json({
      plans: SUBSCRIPTION_PLANS,
      currentPlan: vendor.subscription?.plan || null,
      isActive,
      subscription: vendor.subscription,
      vendorStatus: vendor.status
    })

  } catch (error) {
    console.error('Get subscription plans error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!plan || !SUBSCRIPTION_PLANS[plan]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    // Récupérer le vendeur
    const { data: vendor } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!vendor) {
      return NextResponse.json({ error: 'Vendeur non trouvé' }, { status: 404 })
    }

    // Vérifier si le vendeur est approuvé
    if (vendor.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Vendeur non approuvé' }, { status: 403 })
    }

    const planDetails = SUBSCRIPTION_PLANS[plan]

    // Créer une transaction Kkiapay (simulation)
    const transactionData = {
      amount: planDetails.price,
      description: `Abonnement ${planDetails.name} - Luxanda`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions/confirm-payment`,
      custom_data: {
        user_id: user.id,
        vendor_id: vendor.id,
        plan: plan
      }
    }

    // En production, appeler l'API Kkiapay ici
    // const kkiapayResponse = await fetch('https://api.kkiapay.me/v1/transactions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.KKIAPAY_SECRET_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(transactionData)
    // })

    // Pour la démo, retourner les données de transaction simulées
    return NextResponse.json({
      success: true,
      transaction: {
        transaction_id: `demo_${Date.now()}`,
        payment_url: `https://payment.kkiapay.me/demo/${Date.now()}`,
        amount: planDetails.price,
        plan: planDetails.name,
        custom_data: transactionData.custom_data
      }
    })

  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
