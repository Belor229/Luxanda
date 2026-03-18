import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// Middleware pour vérifier l'abonnement actif
export async function checkSubscriptionActive(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { authorized: false, reason: 'Non authentifié' }
  }

  // Récupérer le vendeur et son abonnement
  const { data: vendor } = await supabase
    .from('vendors')
    .select(`
      *,
      subscription:subscriptions(*)
    `)
    .eq('user_id', user.id)
    .single()

  if (!vendor) {
    return { authorized: false, reason: 'Vendeur non trouvé' }
  }

  // Vérifier si le vendeur est approuvé
  if (vendor.status !== 'APPROVED') {
    return { authorized: false, reason: 'Vendeur non approuvé' }
  }

  // Vérifier si l'abonnement est actif
  const isActive = vendor.subscription?.status === 'ACTIVE' && 
                   new Date(vendor.subscription.end_date) > new Date()

  if (!isActive) {
    return { authorized: false, reason: 'Abonnement inactif ou expiré' }
  }

  return { authorized: true, vendor, subscription: vendor.subscription }
}

// Middleware pour les routes protégées
export function withSubscriptionCheck(handler: (req: NextRequest, context: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context: any) => {
    const subscriptionCheck = await checkSubscriptionActive(request)
    
    if (!subscriptionCheck.authorized) {
      return NextResponse.json(
        { error: subscriptionCheck.reason },
        { status: 403 }
      )
    }

    return handler(request, { ...context, vendor: subscriptionCheck.vendor, subscription: subscriptionCheck.subscription })
  }
}
