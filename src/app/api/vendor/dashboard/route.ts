export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // 1. Get Vendor info
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (vendorError || !vendor) {
      return NextResponse.json({ error: 'Compte vendeur non trouvé' }, { status: 404 })
    }

    // 2. Get Statistics (Using correct field names and capitalized status)
    const [{ count: totalProducts }, { count: activeProducts }, { count: pendingOrders }, { data: totalSalesData }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('vendorId', vendor.id),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('vendorId', vendor.id).eq('status', 'ACTIVE'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('vendorId', vendor.id).eq('status', 'PENDING'),
      supabase.from('orders').select('total_amount').eq('vendorId', vendor.id).eq('status', 'DELIVERED')
    ])

    const totalRevenue = totalSalesData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0

    // 3. Get Recent Data
    const [{ data: recentProducts }, { data: recentOrders }] = await Promise.all([
      supabase.from('products').select('*').eq('vendorId', vendor.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('orders').select('*, profile:users(full_name)').eq('vendorId', vendor.id).order('created_at', { ascending: false }).limit(5)
    ])

    // 4. Get Subscription info (Linked via userId as per schema)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Calculate days left in trial or subscription
    let daysLeft = 0
    let isExpired = false
    const now = new Date()
    
    // Check trial expiration first
    if (subscription?.trial_end_date) {
      const trialEnd = new Date(subscription.trial_end_date)
      daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      isExpired = daysLeft <= 0
    } else if (subscription?.end_date) {
      const end = new Date(subscription.end_date)
      daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      isExpired = daysLeft <= 0
    }

    // Force status to EXPIRED if past due date
    if (isExpired && subscription?.status === 'ACTIVE') {
      await supabase
        .from('subscriptions')
        .update({ status: 'EXPIRED' })
        .eq('id', subscription.id)
    }

    return NextResponse.json({
      vendor: {
        id: vendor.id,
        storeName: vendor.store_name,
        status: vendor.status
      },
      stats: {
        products: {
          total: totalProducts || 0,
          active: activeProducts || 0
        },
        orders: {
          pending: pendingOrders || 0,
          revenue: totalRevenue
        },
        subscription: subscription ? {
          plan: subscription.plan,
          status: isExpired ? 'EXPIRED' : subscription.status,
          expiresAt: subscription.end_date || subscription.trial_end_date,
          isTrial: !!subscription.trial_end_date && subscription.amount === 0,
          daysLeft: Math.max(0, daysLeft)
        } : null
      },
      products: recentProducts || [],
      orders: recentOrders || []
    })

  } catch (error) {
    console.error('Vendor dashboard error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des données du dashboard' }, { status: 500 })
  }
}
