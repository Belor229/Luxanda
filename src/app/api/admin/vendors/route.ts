import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { NotificationsService } from '@/lib/notifications'
import { z } from 'zod'

const adminActionSchema = z.object({
    vendor_id: z.string().uuid(),
    action: z.enum(['approve', 'reject', 'suspend', 'approve_registration', 'approve_activation']),
    reason: z.string().optional()
})

export async function POST(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        if (authError || !authUser) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const admin = await prisma.user.findUnique({
            where: { id: authUser.id },
            select: { role: true }
        })

        if (admin?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
        }

        const body = await request.json()
        const { vendor_id, action, reason } = adminActionSchema.parse(body)

        const vendor = await prisma.vendor.findUnique({
            where: { id: vendor_id },
            include: { user: { include: { profile: true } } }
        })

        if (!vendor) {
            return NextResponse.json({ error: 'Vendeur non trouvé' }, { status: 404 })
        }

        let updateData: any = {}
        let subscriptionStatus: any = undefined

        switch (action) {
            case 'approve_registration':
                updateData = {
                    status: 'APPROVED_REGISTRATION',
                    registrationConfirmedAt: new Date(),
                    admin_notes: reason || 'Inscription approuvée par admin - En attente d\'activation par le vendeur'
                }
                break

            case 'approve_activation':
                updateData = {
                    status: 'APPROVED',
                    activationConfirmedAt: new Date(),
                    trial_start_date: new Date(),
                    trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    admin_notes: reason || 'Boutique activée et approuvée par admin'
                }
                subscriptionStatus = 'ACTIVE'
                break

            case 'approve':
                // Legacy or direct full approval
                updateData = {
                    status: 'APPROVED',
                    registrationConfirmedAt: new Date(),
                    activationConfirmedAt: new Date(),
                    trial_start_date: new Date(),
                    trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    admin_notes: reason || 'Approuvé par admin'
                }
                subscriptionStatus = 'ACTIVE'
                break

            case 'reject':
                updateData = {
                    status: 'REJECTED',
                    rejectionReason: reason || 'Information insuffisante',
                    admin_notes: reason || 'Rejeté par admin'
                }
                subscriptionStatus = 'CANCELLED'
                break

            case 'suspend':
                updateData = {
                    status: 'SUSPENDED',
                    admin_notes: reason || 'Suspendu par admin'
                }
                subscriptionStatus = 'EXPIRED'
                break
        }

        const updatedVendor = await prisma.vendor.update({
            where: { id: vendor_id },
            data: updateData
        })

        // Update subscriptions if any
        await prisma.subscription.updateMany({
            where: { vendorId: vendor_id, status: 'PENDING' },
            data: { status: subscriptionStatus }
        })

        // Audit Log
        await prisma.auditLog.create({
            data: {
                adminId: authUser.id,
                action: `VENDOR_${action.toUpperCase()}`,
                targetId: vendor_id,
                details: reason || `Vendor ${action} without specific reason`
            }
        })

        // Notifications
        if (vendor.user.profile?.phone) {
            if (action === 'approve') {
                await NotificationsService.sendApprovalNotif(vendor.user.profile.phone, vendor.storeName)
            } else if (action === 'reject') {
                await NotificationsService.sendRejectionNotif(vendor.user.profile.phone, vendor.storeName, reason || 'Dossier incomplet')
            }
        }

        return NextResponse.json({ 
            success: true, 
            vendor: updatedVendor,
            message: `Vendeur ${action} avec succès`
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 })
        }
        console.error('Admin action error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        if (authError || !authUser) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const admin = await prisma.user.findUnique({
            where: { id: authUser.id }
        })

        if (admin?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        const vendors = await prisma.vendor.findMany({
            where: status ? { status: status as any } : {},
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        profile: {
                            select: { phone: true }
                        }
                    }
                },
                subscriptions: {
                    select: {
                        status: true,
                        startDate: true,
                        endDate: true
                    },
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(vendors)

    } catch (error) {
        console.error('Admin vendors fetch error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
