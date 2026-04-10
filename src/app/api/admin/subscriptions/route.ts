import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAdmin } from '@/lib/admin-auth'
import { logAdminAction } from '@/lib/admin-logger'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

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
        const page = parseInt(searchParams.get('page') || '1')
        const limit = 20
        const skip = (page - 1) * limit

        const [subscriptions, total] = await Promise.all([
            prisma.subscription.findMany({
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { email: true, name: true } },
                    vendor: { select: { storeName: true } }
                }
            }),
            prisma.subscription.count()
        ])

        return NextResponse.json({
            subscriptions,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching admin subscriptions:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}

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
        const { subscriptionId, action, reason } = body

        if (action === 'CANCEL') {
            const sub = await prisma.subscription.update({
                where: { id: subscriptionId },
                data: { status: 'CANCELLED' }
            })

            await logAdminAction(authUser.id, 'CANCEL_SUBSCRIPTION', subscriptionId, { reason, plan: sub.plan })
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Action non supportée' }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de l\'action' }, { status: 500 })
    }
}
