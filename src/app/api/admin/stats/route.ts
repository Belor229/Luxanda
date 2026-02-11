import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Role } from '@prisma/client'

// Force dynamic since we use cookies
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // Check admin role
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user || user.role !== Role.ADMIN) {
            return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 })
        }

        const [
            totalUsers,
            totalVendors,
            totalProducts,
            pendingVendors
        ] = await Promise.all([
            prisma.user.count(),
            prisma.vendor.count(),
            prisma.product.count(),
            prisma.vendor.count({ where: { status: 'PENDING' } })
        ])

        return NextResponse.json({
            totalUsers,
            totalVendors,
            totalProducts,
            pendingVendors
        })
    } catch (error) {
        console.error('Admin Stats API error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
