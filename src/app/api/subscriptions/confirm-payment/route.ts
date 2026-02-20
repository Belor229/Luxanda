import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { verifyKkiapayTransaction } from '@/lib/kkiapay'

export async function POST(request: NextRequest) {
  try {
    const { transactionId, plan } = await request.json()
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // 1. Verify transaction with Kkiapay API
    const kkiapayData = await verifyKkiapayTransaction(transactionId)

    if (!kkiapayData || kkiapayData.status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Paiement non valide ou échoué' }, { status: 400 })
    }

    // 2. Validate amount (Optionnel mais recommandé)
    // Ici on devrait normalement vérifier que kkiapayData.amount correspond au montant du plan Luxanda

    // 3. Update or Create Subscription in Supabase
    const duration = 30 // standard 30 days
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + duration)

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: 'ACTIVE',
        payment_ref: transactionId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('userId', session.user.id)
      .eq('status', 'PENDING')
      .select()
      .single()

    if (subError) {
      // If no PENDING sub found, we create a new one (safety)
      await supabase.from('subscriptions').insert({
        userId: session.user.id,
        plan: plan.toUpperCase(),
        amount: kkiapayData.amount,
        status: 'ACTIVE',
        payment_ref: transactionId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
    }

    // 4. Update vendor status if they were pending
    await supabase
      .from('vendors')
      .update({ status: 'APPROVED' })
      .eq('userId', session.user.id)

    return NextResponse.json({ success: true, message: 'Paiement confirmé' })
  } catch (error) {
    console.error('Confirm Payment Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la confirmation du paiement' },
      { status: 500 }
    )
  }
}

