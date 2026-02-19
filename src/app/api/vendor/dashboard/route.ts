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

    // Find vendor record
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Compte vendeur non trouvé' }, { status: 404 })
    }

    // Get products stats
    const totalProducts = await prisma.product.count({
      where: { vendorId: vendor.id }
    })

    const activeProducts = await prisma.product.count({
      where: { vendorId: vendor.id, status: 'ACTIVE' }
    })

    const featuredProducts = await prisma.product.count({
      where: { vendorId: vendor.id, featured: true }
    })

    // Get subscription info (including trial)
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        plan: true,
        status: true,
        endDate: true,
        trialEndDate: true,
        amount: true
      }
    })

    // Get recent products
    const productsList = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      stats: {
        products: {
          total: totalProducts,
          active: activeProducts,
          featured: featuredProducts
        },
        subscription: {
          plan: subscription?.plan || 'NONE',
          status: subscription?.status || 'INACTIVE',
          expiresAt: subscription?.endDate || null,
          trialEndDate: subscription?.trialEndDate || null,
          isTrial: subscription?.trialEndDate !== null && subscription?.amount === 0,
          amount: subscription?.amount || 0
        }
      },
      products: productsList
    })

  } catch (error) {
    console.error('Vendor dashboard error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des données du dashboard' }, { status: 500 })
  }
}
