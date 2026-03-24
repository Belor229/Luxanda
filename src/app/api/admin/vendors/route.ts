import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { NotificationsService } from '@/lib/notifications'
import { assertAdmin } from '@/lib/admin-auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

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

        const gate = await assertAdmin(authUser, supabase)
        if (!gate.ok) {
            return NextResponse.json({ error: gate.message }, { status: gate.status })
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

        // Update subscriptions if any (évite data: { status: undefined })
        if (subscriptionStatus !== undefined) {
            await prisma.subscription.updateMany({
                where: { vendorId: vendor_id, status: 'PENDING' },
                data: { status: subscriptionStatus },
            })
        }

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

        const gate = await assertAdmin(authUser, supabase)
        if (!gate.ok) {
            return NextResponse.json({ error: gate.message }, { status: gate.status })
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
        const vendorsWithDocUrls = vendors.map((vendor) => {
            const idCardUrl = vendor.id_card_url
                ? supabase.storage.from('identity-documents').getPublicUrl(vendor.id_card_url).data.publicUrl
                : null
            const selfieUrl = vendor.selfie_url
                ? supabase.storage.from('identity-documents').getPublicUrl(vendor.selfie_url).data.publicUrl
                : null
            const ifuUrl = vendor.ifu_url
                ? supabase.storage.from('identity-documents').getPublicUrl(vendor.ifu_url).data.publicUrl
                : null
            const rccmUrl = vendor.rccm_url
                ? supabase.storage.from('identity-documents').getPublicUrl(vendor.rccm_url).data.publicUrl
                : null

            return {
                ...vendor,
                id_card_url: idCardUrl,
                selfie_url: selfieUrl,
                ifu_url: ifuUrl,
                rccm_url: rccmUrl,
            }
        })

        return NextResponse.json(vendorsWithDocUrls)

    } catch (error) {
        console.error('Admin vendors fetch error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
