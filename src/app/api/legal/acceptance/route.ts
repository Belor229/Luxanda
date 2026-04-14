import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

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

        await prisma.legalAcceptanceLog.create({
            data: {
                userId: user.id,
                documentVersion: version,
                date: new Date(),
                ip,
                userAgent,
            }
        })
        
        return NextResponse.json({ success: true })
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

        const latestLog = await prisma.legalAcceptanceLog.findFirst({
            where: { userId: user.id },
            orderBy: { date: 'desc' },
        })

        if (!latestLog) {
            return NextResponse.json({ cgu_version: null, accepted_at: null })
        }

        return NextResponse.json({
            cgu_version: latestLog.documentVersion,
            accepted_at: latestLog.date,
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

