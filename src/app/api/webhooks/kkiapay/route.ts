import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Interface pour les événements Kkiapay
interface KkiapayEvent {
  event: string
  transaction_id: string
  status: string
  amount: number
  fees: number
  currency: string
  custom_data?: {
    user_id?: string
    vendor_id?: string
    plan?: string
  }
  metadata?: Record<string, any>
  created_at: string
}

// Interface pour la signature
interface KkiapaySignature {
  signature: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // 1. Vérification de la signature Kkiapay
    const signature = request.headers.get('x-kkiapay-signature')
    const timestamp = request.headers.get('x-kkiapay-timestamp')
    
    if (!signature || !timestamp) {
      console.error('Webhook: Signature ou timestamp manquant')
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
    }

    // Récupérer le corps de la requête
    const body = await request.text()
    
    // Vérifier la signature avec la clé secrète
    const secretKey = process.env.KKIAPAY_SECRET_KEY
    if (!secretKey) {
      console.error('Webhook: Clé secrète Kkiapay non configurée')
      return NextResponse.json({ error: 'Configuration serveur' }, { status: 500 })
    }

    // Créer la signature attendue
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(`${timestamp}.${body}`)
      .digest('hex')

    // Comparer les signatures (timing-safe comparison)
    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )

    if (!isValidSignature) {
      console.error('Webhook: Signature invalide')
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
    }

    // 2. Parser l'événement
    const event: KkiapayEvent = JSON.parse(body)
    
    console.log('Webhook: Événement reçu', {
      event: event.event,
      transaction_id: event.transaction_id,
      status: event.status
    })

    // 3. Vérifier si la transaction a déjà été traitée (idempotence)
    const { data: existingTransaction } = await supabase
      .from('payment_logs')
      .select('id')
      .eq('transaction_id', event.transaction_id)
      .single()

    if (existingTransaction) {
      console.log('Webhook: Transaction déjà traitée', event.transaction_id)
      return NextResponse.json({ message: 'Transaction déjà traitée' })
    }

    // 4. Valider la transaction avec l'API Kkiapay
    const verificationResponse = await fetch(`https://api.kkiapay.me/v1/transactions/${event.transaction_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!verificationResponse.ok) {
      console.error('Webhook: Échec de vérification transaction Kkiapay')
      return NextResponse.json({ error: 'Échec de vérification transaction' }, { status: 400 })
    }

    const verificationData = await verificationResponse.json()
    
    // 5. Traiter l'événement selon le statut
    if (event.status === 'SUCCESS' && verificationData.status === 'SUCCESS') {
      await handleSuccessfulPayment(event, supabase)
    } else if (event.status === 'FAILED') {
      await handleFailedPayment(event, supabase)
    }

    // 6. Enregistrer le log du webhook
    await supabase
      .from('webhook_logs')
      .insert({
        event_type: event.event,
        transaction_id: event.transaction_id,
        status: event.status,
        payload: event,
        processed_at: new Date().toISOString()
      })

    return NextResponse.json({ message: 'Webhook traité avec succès' })

  } catch (error) {
    console.error('Webhook: Erreur traitement', error)
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 })
  }
}

async function handleSuccessfulPayment(event: KkiapayEvent, supabase: any) {
  let custom_data = event.custom_data

  // Kkiapay sometimes sends custom_data as a stringified JSON
  if (typeof custom_data === 'string') {
    try {
      custom_data = JSON.parse(custom_data)
    } catch (e) {
      console.error('Webhook: Erreur parsing custom_data', e)
    }
  }
  
  if (!custom_data?.user_id || !custom_data?.vendor_id || !custom_data?.plan) {
    console.error('Webhook: Données personnalisées manquantes', custom_data)
    throw new Error('Données personnalisées manquantes')
  }

  // 1. Enregistrer le log de paiement
  await supabase
    .from('payment_logs')
    .insert({
      user_id: custom_data.user_id,
      transaction_id: event.transaction_id,
      status: 'SUCCESS',
      amount: event.amount,
      plan: custom_data.plan,
      client_phone: event.metadata?.phone || null,
      payment_date: new Date().toISOString()
    })

  // 2. Mettre à jour l'abonnement
  const startDate = new Date()
  const endDate = new Date()
  
  // Définir la durée selon le plan
  switch (custom_data.plan) {
    case 'STARTER':
      endDate.setMonth(endDate.getMonth() + 1)
      break
    case 'PRO':
      endDate.setMonth(endDate.getMonth() + 3)
      break
    case 'PREMIUM':
      endDate.setFullYear(endDate.getFullYear() + 1)
      break
    default:
      endDate.setMonth(endDate.getMonth() + 1)
  }

  await supabase
    .from('subscriptions')
    .upsert({
      userId: custom_data.user_id,
      vendorId: custom_data.vendor_id,
      plan: custom_data.plan,
      status: 'ACTIVE',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      paymentRef: event.transaction_id,
      amount: event.amount,
      updatedAt: new Date().toISOString()
    }, {
      onConflict: 'userId'
    })

  // 3. Mettre à jour le statut du vendeur si nécessaire
  await supabase
    .from('vendors')
    .update({
      status: 'APPROVED',
      updatedAt: new Date().toISOString()
    })
    .eq('id', custom_data.vendor_id)

  console.log('Webhook: Paiement réussi traité', {
    transaction_id: event.transaction_id,
    vendor_id: custom_data.vendor_id,
    plan: custom_data.plan
  })
}

async function handleFailedPayment(event: KkiapayEvent, supabase: any) {
  let custom_data = event.custom_data
  if (typeof custom_data === 'string') {
    try {
      custom_data = JSON.parse(custom_data)
    } catch (e) {}
  }
  
  // Enregistrer l'échec
  await supabase
    .from('payment_logs')
    .insert({
      user_id: custom_data?.user_id || null,
      transaction_id: event.transaction_id,
      status: 'FAILED',
      amount: event.amount,
      plan: custom_data?.plan || null,
      client_phone: event.metadata?.phone || null,
      payment_date: new Date().toISOString(),
      failure_reason: event.metadata?.reason || 'Payment failed'
    })

  console.log('Webhook: Échec paiement traité', event.transaction_id)
}
