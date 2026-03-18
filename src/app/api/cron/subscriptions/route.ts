import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { NotificationsService } from '@/lib/notifications'

/**
 * Endpoint Cron pour la gestion des expirations d'abonnements
 * Doit être sécurisé par un secret (CRON_SECRET) dans Vercel
 */
export async function GET(request: Request) {
  // Check CRON_SECRET if provided
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const now = new Date()
    
    // 1. Rappel J-3 (3 jours avant expiration)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const nextThreeDays = new Date(threeDaysFromNow)
    nextThreeDays.setHours(23, 59, 59, 999)
    threeDaysFromNow.setHours(0, 0, 0, 0)

    const expiringSoon3 = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: threeDaysFromNow,
          lte: nextThreeDays
        }
      },
      include: { vendor: { include: { user: { include: { profile: true } } } } }
    })

    for (const sub of expiringSoon3) {
      if (sub.vendor.user.profile?.phone) {
        await NotificationsService.sendExpirationReminder(sub.vendor.user.profile.phone, sub.vendor.storeName, 3)
      }
    }

    // 2. Rappel J-1 (1 jour avant expiration)
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
    const nextOneDay = new Date(oneDayFromNow)
    nextOneDay.setHours(23, 59, 59, 999)
    oneDayFromNow.setHours(0, 0, 0, 0)

    const expiringSoon1 = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: oneDayFromNow,
          lte: nextOneDay
        }
      },
      include: { vendor: { include: { user: { include: { profile: true } } } } }
    })

    for (const sub of expiringSoon1) {
      if (sub.vendor.user.profile?.phone) {
        await NotificationsService.sendExpirationReminder(sub.vendor.user.profile.phone, sub.vendor.storeName, 1)
      }
    }

    // 3. Expiration Automatique
    const expired = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: now
        }
      },
      include: { vendor: { include: { user: { include: { profile: true } } } } }
    })

    const expiredIds = expired.map((s: any) => s.id)
    const vendorIds = expired.map((s: any) => s.vendorId)

    if (expiredIds.length > 0) {
      await prisma.$transaction([
        // Désactiver les abonnements
        prisma.subscription.updateMany({
          where: { id: { in: expiredIds } },
          data: { status: 'EXPIRED' }
        }),
        // Suspendre les vendeurs (automatiquement)
        prisma.vendor.updateMany({
          where: { id: { in: vendorIds } },
          data: { status: 'SUSPENDED_AUTO' }
        })
      ])

      // Envoyer notifications d'expiration
      for (const sub of expired) {
        if (sub.vendor.user.profile?.phone) {
          await NotificationsService.sendExpirationReminder(sub.vendor.user.profile.phone, sub.vendor.storeName, 0)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: {
        reminders3: expiringSoon3.length,
        reminders1: expiringSoon1.length,
        expired: expired.length
      }
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
