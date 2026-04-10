import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

interface KkiapayEvent {
  event: string
  transaction_id: string
  status: string
  amount: number
  fees: number
  currency: string
  custom_data?: any
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-kkiapay-signature')
    const timestamp = request.headers.get('x-kkiapay-timestamp')
    
    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Signature manquante' }, { status: 401 })
    }

    const body = await request.text()
    const secretKey = process.env.KKIAPAY_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Configuration serveur' }, { status: 500 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(`${timestamp}.${body}`)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
    }

    const event: KkiapayEvent = JSON.parse(body)
    
    // Vérifier la transaction avec Kkiapay (Double vérification)
    const verificationResponse = await fetch(`https://api.kkiapay.me/v1/transactions/${event.transaction_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!verificationResponse.ok) {
      return NextResponse.json({ error: 'Échec de vérification' }, { status: 400 })
    }

    const verificationData = await verificationResponse.json()
    
    if (event.status === 'SUCCESS' && verificationData.status === 'SUCCESS') {
      await handleSuccessfulPayment(event)
    }

    return NextResponse.json({ message: 'Webhook traité' })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

async function handleSuccessfulPayment(event: KkiapayEvent) {
  let custom_data = event.custom_data
  if (typeof custom_data === 'string') {
    try { custom_data = JSON.parse(custom_data) } catch (e) {}
  }

  const { user_id, vendor_id, plan } = custom_data || {}
  
  if (!user_id || !plan) return

  const startDate = new Date()
  const endDate = new Date()
  
  switch (plan) {
    case 'STARTER': endDate.setMonth(endDate.getMonth() + 1); break
    case 'PRO': endDate.setMonth(endDate.getMonth() + 3); break
    case 'PREMIUM': endDate.setFullYear(endDate.getFullYear() + 1); break
    default: endDate.setMonth(endDate.getMonth() + 1)
  }

  // Utiliser Prisma pour les mises à jour atomiques
  await prisma.$transaction([
    // 1. Mettre à jour ou créer l'abonnement
    prisma.subscription.upsert({
      where: { id: user_id }, // Ou une autre clé unique si nécessaire
      update: {
        plan: plan,
        status: 'ACTIVE',
        startDate: startDate,
        endDate: endDate,
        paymentRef: event.transaction_id,
        amount: event.amount,
      },
      create: {
        userId: user_id,
        vendorId: vendor_id,
        plan: plan,
        status: 'ACTIVE',
        startDate: startDate,
        endDate: endDate,
        paymentRef: event.transaction_id,
        amount: event.amount,
      }
    }),
    // 2. Activer le vendeur si applicable
    ...(vendor_id ? [
      prisma.vendor.update({
        where: { id: vendor_id },
        data: { status: 'APPROVED', activationConfirmedAt: new Date() }
      })
    ] : [])
  ])
}
