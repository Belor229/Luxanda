import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const acceptanceSchema = z.object({
    version: z.string().min(1)
})

export async function POST(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

        const body = await request.json()
        const { version } = acceptanceSchema.parse(body)

        const { error } = await supabase
            .from('legal_acceptance_logs')
            .insert({
                userId: user.id,
                documentVersion: version,
                date: new Date().toISOString(),
                ip: request.headers.get('x-forwarded-for') || '0.0.0.0',
                userAgent: request.headers.get('user-agent') || 'unknown'
            })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
        }
        console.error('Legal acceptance API error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

        const { data, error } = await supabase
            .from('legal_acceptance_logs')
            .select('documentVersion, date')
            .eq('userId', user.id)
            .order('date', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"

        return NextResponse.json({
            cgu_version: data?.documentVersion || null,
            accepted_at: data?.date || null
        })
    } catch (error) {
        console.error('Fetch legal status error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
