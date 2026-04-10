import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAdmin } from '@/lib/admin-auth'
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

        const [transactions, total] = await Promise.all([
            prisma.financeTransaction.findMany({
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { email: true, name: true } }
                }
            }),
            prisma.financeTransaction.count()
        ])

        return NextResponse.json({
            transactions,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching admin transactions:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
