import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { assertAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        const gate = await assertAdmin(authUser, supabase)
        if (!gate.ok) {
            return NextResponse.json({ error: gate.message }, { status: gate.status })
        }

        const [
            totalUsers,
            totalVendors,
            totalProducts,
            pendingVendors,
            activeSubscriptions,
            totalReports
        ] = await Promise.all([
            prisma.user.count(),
            prisma.vendor.count(),
            prisma.product.count(),
            prisma.vendor.count({ where: { status: 'PENDING' } }),
            prisma.subscription.count({ where: { status: 'ACTIVE' } }),
            prisma.report.count({ where: { status: 'PENDING' } })
        ])

        return NextResponse.json({
            totalUsers,
            totalVendors,
            totalProducts,
            pendingVendors,
            activeSubscriptions,
            totalReports
        })
    } catch (error) {
        console.error('Admin Stats API error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
