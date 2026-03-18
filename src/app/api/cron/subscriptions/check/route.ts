import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Endpoint cron pour vérifier les abonnements expirés
 * À appeler régulièrement (ex: une fois par jour via Vercel Cron)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification basique d'un secret pour éviter les appels non autorisés
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const now = new Date()

    // 1. Suspendre les abonnements dont la date de fin est dépassée et le statut est ACTIVE
    const expiredSubscriptions = await prisma.subscription.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: now
        }
      },
      data: {
        status: 'EXPIRED',
        updatedAt: now
      }
    })

    // 2. Suspendre les vendeurs dont l'essai ou l'abonnement est expiré
    // On cherche les vendeurs APPROVED qui n'ont plus d'abonnement ACTIVE
    const vendorsToSuspend = await prisma.vendor.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          {
            trial_end_date: {
              lt: now
            }
          },
          {
            subscriptions: {
              none: {
                status: 'ACTIVE'
              }
            }
          }
        ]
      },
      select: {
        id: true
      }
    })

    let suspendedCount = 0
    if (vendorsToSuspend.length > 0) {
      const vendorIds = vendorsToSuspend.map(v => v.id)
      const result = await prisma.vendor.updateMany({
        where: {
          id: {
            in: vendorIds
          }
        },
        data: {
          status: 'SUSPENDED', // Ou SUSPENDED_AUTO si ajouté à l'enum
          updatedAt: now
        }
      })
      suspendedCount = result.count
    }

    return NextResponse.json({
      success: true,
      processedAt: now.toISOString(),
      expiredSubscriptions: expiredSubscriptions.count,
      suspendedVendors: suspendedCount
    })

  } catch (error: any) {
    console.error('Cron Subscriptions Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
