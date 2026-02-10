import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const userId = session.user.id

    // Get user's affiliation stats
    const affiliationStats = await prisma.referral.aggregate({
      where: { referrerId: userId },
      _count: { referredId: true },
      _sum: {
        commission: true
      }
    })

    // Get recent referrals
    const recentReferrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const referrals = recentReferrals.map((ref: any) => ({
      id: ref.id,
      commission_amount: ref.commission,
      status: ref.status,
      created_at: ref.createdAt,
      first_name: ref.referred.profile?.firstName,
      last_name: ref.referred.profile?.lastName,
      email: ref.referred.email
    }))

    const baseUrl = process.env.FRONTEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    return NextResponse.json({
      affiliationLink: `${baseUrl}/register?ref=${userId}`,
      stats: {
        totalReferrals: affiliationStats._count?.referredId || 0,
        totalEarnings: affiliationStats._sum?.commission || 0,
        pendingEarnings: 0
      },
      recentReferrals: referrals
    })

  } catch (error) {
    console.error('Affiliation stats error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des statistiques d\'affiliation' }, { status: 500 })
  }
}
