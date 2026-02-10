import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referrer_id, referred_id, commission_rate = 30.00 } = body

    if (!referrer_id || !referred_id) {
      return NextResponse.json({ error: 'ID du parrain ou du filleul manquant' }, { status: 400 })
    }

    // Check if referral already exists
    const existingReferral = await prisma.referral.findUnique({
      where: {
        referrerId_referredId: {
          referrerId: referrer_id,
          referredId: referred_id
        }
      }
    })

    if (existingReferral) {
      return NextResponse.json({ error: 'Ce parrainage existe déjà' }, { status: 400 })
    }

    // Create new referral
    const newReferral = await prisma.referral.create({
      data: {
        referrerId: referrer_id,
        referredId: referred_id,
        commission: commission_rate,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      message: 'Parrainage créé avec succès',
      referralId: newReferral.id
    })
  } catch (error) {
    console.error('Create referral error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du parrainage' }, { status: 500 })
  }
}
