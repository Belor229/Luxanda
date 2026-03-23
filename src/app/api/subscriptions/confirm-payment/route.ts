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
      // Log failed transaction attempt
      await supabase.from('payment_logs').insert({
        user_id: session.user.id,
        transaction_id: transactionId,
        status: 'FAILED',
        amount: kkiapayData?.amount || 0,
        plan,
        error: 'Transaction Kkiapay invalide'
      })
      return NextResponse.json({ error: 'Paiement non valide ou échoué' }, { status: 400 })
    }

    // 2. Validate amount and plan
    const planPrices: Record<string, number> = { STARTER: 5000, PRO: 15000, PREMIUM: 30000 }
    const planKey = plan.toUpperCase() as keyof typeof planPrices
    const expectedAmount = planPrices[planKey]
    
    if (!expectedAmount || kkiapayData.amount !== expectedAmount) {
      await supabase.from('payment_logs').insert({
        user_id: session.user.id,
        transaction_id: transactionId,
        status: 'FAILED',
        amount: kkiapayData.amount,
        expectedAmount,
        plan,
        error: 'Montant invalide'
      })
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
    }

    // 3. Check for duplicate transaction
    const { data: existingPayment } = await supabase
      .from('subscriptions')
      .select('payment_ref')
      .eq('payment_ref', transactionId)
      .single()

    if (existingPayment) {
      return NextResponse.json({ error: 'Transaction déjà traitée' }, { status: 400 })
    }

    // 4. Update or Create Subscription in Supabase
    const duration = 30 // standard 30 days
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + duration)

    // Log successful transaction
    await supabase.from('payment_logs').insert({
      user_id: session.user.id,
      transaction_id: transactionId,
      status: 'SUCCESS',
      amount: kkiapayData.amount,
      plan,
      client_phone: kkiapayData.client_phone
    })

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: 'ACTIVE',
        payment_ref: transactionId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)
      .eq('status', 'PENDING')
      .select()
      .single()

    if (subError) {
      // If no PENDING sub found, we create a new one (safety)
      await supabase.from('subscriptions').insert({
        user_id: session.user.id,
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
      .eq('user_id', session.user.id)

    return NextResponse.json({ success: true, message: 'Paiement confirmé' })
  } catch (error) {
    console.error('Confirm Payment Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la confirmation du paiement' },
      { status: 500 }
    )
  }
}

