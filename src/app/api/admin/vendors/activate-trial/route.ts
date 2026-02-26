import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const { vendorId } = await request.json()

        if (!vendorId) {
            return NextResponse.json({ error: 'ID du vendeur requis' }, { status: 400 })
        }

        const cookieStore = cookies()
        const supabase = createClient(cookies())

        // 1. Verify requester is ADMIN
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (!profile || profile.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
        }

        // 2. Activate Trial
        const trial_start = new Date()
        const trial_end = new Date()
        trial_end.setDate(trial_end.getDate() + 14) // 14 days trial

        const { data, error } = await supabase
            .from('vendors')
            .update({
                status: 'APPROVED',
                trial_start_date: trial_start.toISOString(),
                trial_end_date: trial_end.toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', vendorId)
            .select()
            .single()

        if (error) {
            console.error('Activation error:', error)
            return NextResponse.json({ error: 'Erreur lors de l\'activation' }, { status: 500 })
        }

        return NextResponse.json({
            message: 'Compte vendeur activé avec succès pour 14 jours.',
            vendor: data
        })
    } catch (error: any) {
        console.error('Admin activation route error:', error)
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
    }
}
