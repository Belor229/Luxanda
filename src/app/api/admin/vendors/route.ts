import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const adminActionSchema = z.object({
    vendor_id: z.string().uuid(),
    action: z.enum(['approve', 'reject', 'suspend']),
    reason: z.string().optional()
})

export async function POST(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // Vérifier si l'utilisateur est admin (pour l'instant, simple vérification)
        const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('user_id', user.id)
            .single()

        const adminEmails = ['admin@luxanda.bj', 'dpo@luxanda.bj'] // Emails admin autorisés
        if (!profile || !adminEmails.includes(profile.email)) {
            return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 })
        }

        const body = await request.json()
        const { vendor_id, action, reason } = adminActionSchema.parse(body)

        let updateData: any = {}
        let subscriptionUpdate: any = {}

        switch (action) {
            case 'approve':
                updateData = {
                    status: 'APPROVED',
                    trial_start_date: new Date().toISOString(),
                    trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 jours
                    admin_notes: reason || 'Approuvé par admin',
                    updated_at: new Date().toISOString()
                }
                subscriptionUpdate = {
                    status: 'TRIAL',
                    trial_start_date: new Date().toISOString(),
                    trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    auto_suspend_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                }
                break

            case 'reject':
                updateData = {
                    status: 'REJECTED',
                    rejection_reason: reason || 'Rejeté par admin',
                    admin_notes: reason || 'Rejeté par admin',
                    updated_at: new Date().toISOString()
                }
                subscriptionUpdate = {
                    status: 'CANCELLED',
                    updated_at: new Date().toISOString()
                }
                break

            case 'suspend':
                updateData = {
                    status: 'SUSPENDED',
                    admin_notes: reason || 'Suspendu par admin',
                    updated_at: new Date().toISOString()
                }
                subscriptionUpdate = {
                    status: 'EXPIRED',
                    updated_at: new Date().toISOString()
                }
                break
        }

        // Mettre à jour le vendeur
        const { data: vendor, error: vendorError } = await supabase
            .from('vendors')
            .update(updateData)
            .eq('id', vendor_id)
            .select()
            .single()

        if (vendorError) throw vendorError

        // Mettre à jour l'abonnement
        const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .update(subscriptionUpdate)
            .eq('vendor_id', vendor_id)

        if (subscriptionError) throw subscriptionError

        return NextResponse.json({ 
            success: true, 
            vendor,
            message: `Vendeur ${action} avec succès`
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ 
                error: 'Données invalides', 
                details: error.issues 
            }, { status: 400 })
        }

        console.error('Admin action error:', error)
        return NextResponse.json({ 
            error: 'Erreur interne du serveur' 
        }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // Vérifier si l'utilisateur est admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('user_id', user.id)
            .single()

        const adminEmails = ['admin@luxanda.bj', 'dpo@luxanda.bj']
        if (!profile || !adminEmails.includes(profile.email)) {
            return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 })
        }

        // Récupérer tous les vendeurs en attente
        const { data: vendors, error } = await supabase
            .from('vendors')
            .select(`
                *,
                user:auth.users(email),
                subscription:subscriptions(status, trial_start_date, trial_end_date)
            `)
            .in('status', ['PENDING_VALIDATION', 'APPROVED', 'REJECTED', 'SUSPENDED', 'SUSPENDED_AUTO'])
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ vendors })

    } catch (error) {
        console.error('Admin vendors fetch error:', error)
        return NextResponse.json({ 
            error: 'Erreur interne du serveur' 
        }, { status: 500 })
    }
}
