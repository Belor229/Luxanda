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

        const ip = request.headers.get('x-forwarded-for') || '0.0.0.0'
        const userAgent = request.headers.get('user-agent') || 'unknown'

        // The table/columns may exist either in snake_case or in camelCase (depends on which Supabase SQL fixes were applied).
        const payloadSnake = {
            user_id: user.id,
            document_version: version,
            date: new Date().toISOString(),
            ip,
            user_agent: userAgent,
        }

        const payloadCamel = {
            userId: user.id,
            documentVersion: version,
            date: new Date().toISOString(),
            ip,
            userAgent,
        }

        const { error: snakeError } = await supabase.from('legal_acceptance_logs').insert(payloadSnake)
        if (!snakeError) return NextResponse.json({ success: true })

        const { error: camelError } = await supabase.from('legal_acceptance_logs').insert(payloadCamel)
        if (!camelError) return NextResponse.json({ success: true })

        // If both attempts failed, surface the last error.
        throw camelError
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
        }
        console.error('Legal acceptance API error:', error)

        const details =
            typeof (error as any)?.message === 'string'
                ? (error as any).message
                : typeof (error as any) === 'string'
                  ? error
                  : undefined

        return NextResponse.json(
            { error: 'Erreur interne du serveur', details },
            { status: 500 },
        )
    }
}

export async function GET(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

        // Try snake_case first.
        const {
            data: snakeData,
            error: snakeError,
        } = await supabase
            .from('legal_acceptance_logs')
            .select('document_version, date')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(1)
            .single()

        if (!snakeError) {
            return NextResponse.json({
                cgu_version: snakeData?.document_version || null,
                accepted_at: snakeData?.date || null,
            })
        }

        // PGRST116 = "no rows returned"
        if (snakeError?.code === 'PGRST116') {
            return NextResponse.json({ cgu_version: null, accepted_at: null })
        }

        // Otherwise try camelCase columns.
        const {
            data: camelData,
            error: camelError,
        } = await supabase
            .from('legal_acceptance_logs')
            .select('documentVersion, date')
            .eq('userId', user.id)
            .order('date', { ascending: false })
            .limit(1)
            .single()

        if (camelError) {
            // If the table uses camelCase but still has no rows, we just return nulls.
            if (camelError.code === 'PGRST116') {
                return NextResponse.json({ cgu_version: null, accepted_at: null })
            }
            throw camelError
        }

        return NextResponse.json({
            cgu_version: camelData?.documentVersion || null,
            accepted_at: camelData?.date || null,
        })
    } catch (error) {
        console.error('Fetch legal status error:', error)
        const details =
            typeof (error as any)?.message === 'string'
                ? (error as any).message
                : typeof (error as any) === 'string'
                  ? error
                  : undefined

        return NextResponse.json(
            { error: 'Erreur interne du serveur', details },
            { status: 500 },
        )
    }
}
