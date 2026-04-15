export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // 1. Get Vendor info via Prisma
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Compte vendeur non trouvé' }, { status: 404 })
    }

    // 2. Statistics
    const [totalProducts, activeProducts, pendingOrders, deliveredItems] = await Promise.all([
      prisma.product.count({ where: { vendorId: vendor.id } }),
      prisma.product.count({ where: { vendorId: vendor.id, status: 'APPROVED' } }),
      prisma.order.count({
        where: {
          status: 'PENDING',
          items: { some: { product: { vendorId: vendor.id } } }
        }
      }),
      prisma.orderItem.findMany({
        where: {
          product: { vendorId: vendor.id },
          order: { status: 'DELIVERED' }
        },
        select: { total: true }
      })
    ])

    const totalRevenue = deliveredItems.reduce((acc, curr) => acc + curr.total, 0)

    // 3. Get Recent Data
    const [recentProducts, rawRecentOrders] = await Promise.all([
      prisma.product.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.order.findMany({
        where: {
          items: { some: { product: { vendorId: vendor.id } } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            include: { profile: true }
          },
          items: {
             where: { product: { vendorId: vendor.id } }
          }
        }
      })
    ])

    // Format recent orders so it matches the expected structure in frontend: order.profile?.full_name, order.total_amount
    const recentOrders = rawRecentOrders.map(order => {
      const vendorTotal = order.items.reduce((sum, item) => sum + item.total, 0)
      return {
        id: order.id,
        created_at: order.createdAt,
        status: order.status.toLowerCase(),
        total_amount: vendorTotal,
        profile: {
          full_name: order.user?.profile?.firstName && order.user?.profile?.lastName 
            ? `${order.user.profile.firstName} ${order.user.profile.lastName}`
            : order.user?.name || 'Client'
        }
      }
    })

    const dbProducts = recentProducts.map(p => ({
      id: p.id,
      title: p.name,
      price: p.price,
      stock: p.quantity,
      image_urls: p.images || []
    }))

    // 4. Get Subscription info
    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate days left in trial or subscription
    let daysLeft = 0
    let isExpired = false
    const now = new Date()
    
    if (subscription?.trialEndDate) {
      const trialEnd = new Date(subscription.trialEndDate)
      daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      isExpired = daysLeft <= 0
    } else if (subscription?.endDate) {
      const end = new Date(subscription.endDate)
      daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      isExpired = daysLeft <= 0
    }

    if (isExpired && subscription?.status === 'ACTIVE') {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' }
      })
    }

    return NextResponse.json({
      vendor: {
        id: vendor.id,
        storeName: vendor.storeName,
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
          expiresAt: subscription.endDate || subscription.trialEndDate,
          isTrial: !!subscription.trialEndDate && subscription.amount === 0,
          daysLeft: Math.max(0, daysLeft)
        } : null
      },
      products: dbProducts,
      orders: recentOrders
    })

  } catch (error) {
    console.error('Vendor dashboard error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des données du dashboard' }, { status: 500 })
  }
}

