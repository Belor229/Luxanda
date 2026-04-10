import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
import { assertAdmin } from '@/lib/admin-auth'
import { logAdminAction } from '@/lib/admin-logger'

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        const gate = await assertAdmin(authUser, supabase)
        if (!gate.ok) {
            return NextResponse.json({ error: gate.message }, { status: gate.status })
        }

        const reports = await prisma.report.findMany({
            include: {
                reporter: { select: { email: true, name: true } },
                vendor: { select: { storeName: true, id: true } },
                product: { select: { name: true, id: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(reports)
    } catch (error) {
        console.error('Admin reports fetch error:', error)
        return NextResponse.json({ error: 'Erreur lors de la récupération des signalements' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        const gate = await assertAdmin(authUser, supabase)
        if (!gate.ok) {
            return NextResponse.json({ error: gate.message }, { status: gate.status })
        }

        const { reportId, action, reason } = await request.json()

        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: { vendor: true, product: true }
        })

        if (!report) {
            return NextResponse.json({ error: 'Signalement non trouvé' }, { status: 404 })
        }

        // Action logic
        if (action === 'RESOLVE') {
            await prisma.report.update({
                where: { id: reportId },
                data: { status: 'RESOLVED' }
            })
        }

        await logAdminAction(
            authUser.id,
            `REPORT_${action}`,
            reportId,
            { reason, action }
        )

        return NextResponse.json({ success: true, message: 'Signalement traité' })

    } catch (error) {
        console.error('Admin report action error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
