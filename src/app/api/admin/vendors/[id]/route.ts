import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { vendorStatusSchema } from '@/lib/validations'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const supabase = createClient(Promise.resolve(cookieStore) as any)

        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // Check admin role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (!profile || profile.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 })
        }

        const body = await request.json()
        const validatedData = vendorStatusSchema.parse(body)

        const isApproving = validatedData.status === 'APPROVED'
        const trial_start = isApproving ? new Date() : null
        const trial_end = isApproving ? new Date() : null
        if (trial_end) trial_end.setDate(trial_end.getDate() + 14)

        const updatePayload: any = {
            status: validatedData.status,
            updated_at: new Date().toISOString()
        }

        if (isApproving) {
            updatePayload.trial_start_date = trial_start?.toISOString()
            updatePayload.trial_end_date = trial_end?.toISOString()
            updatePayload.verified = true
        }

        const { data: updatedVendor, error } = await supabase
            .from('vendors')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        // If approving, also update the subscription
        if (isApproving && updatedVendor) {
            await supabase
                .from('subscriptions')
                .update({
                    status: 'ACTIVE',
                    start_date: trial_start?.toISOString(),
                    trial_end_date: trial_end?.toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('userId', updatedVendor.userId)
                .eq('status', 'PENDING')
        }

        return NextResponse.json(updatedVendor)
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
        }
        console.error('Admin Vendor Update API error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
