import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const userId = session.user.id

    // 1. Get referral statistics
    // Since aggregations are limited in Supabase client, we fetch basic counts/sums
    const { data: referralsData, error: referralsError } = await supabase
      .from('referrals')
      .select('commission, status, created_at, referred_id')
      .eq('referrer_id', userId)

    if (referralsError && referralsError.code !== 'PGRST116') throw referralsError

    const totalReferrals = referralsData?.length || 0
    const totalEarnings = referralsData?.reduce((acc, curr) => acc + (curr.commission || 0), 0) || 0

    // 2. Get recent referrals with details (joining profiles)
    // Note: Assuming referred_id links to profiles
    const { data: recentReferrals, error: recentError } = await supabase
      .from('referrals')
      .select(`
        id,
        commission,
        status,
        created_at,
        referred:users!referred_id (
          full_name,
          avatar_url
        )
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentError) throw recentError

    const formattedReferrals = (recentReferrals || []).map((ref: any) => ({
      id: ref.id,
      commission_amount: ref.commission,
      status: ref.status,
      created_at: ref.created_at,
      full_name: ref.referred?.full_name || 'Utilisateur Luxanda',
      avatar_url: ref.referred?.avatar_url
    }))

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxanda.bj'

    return NextResponse.json({
      affiliationLink: `${baseUrl}/register?ref=${userId}`,
      stats: {
        totalReferrals,
        totalEarnings,
        pendingEarnings: 0
      },
      recentReferrals: formattedReferrals
    })

  } catch (error: any) {
    console.error('Affiliation stats error:', error)
    return NextResponse.json({
      error: 'Erreur lors de la récupération des statistiques d\'affiliation',
      details: error.message
    }, { status: 500 })
  }
}
