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

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        const where: any = {}
        if (status) {
            where.status = status
        }

        const vendors = await prisma.vendor.findMany({
            where,
            include: {
                user: {
                    select: { email: true, name: true, phone: true } // Assuming phone is on Profile, but checking user relations
                },
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(vendors)
    } catch (error) {
        console.error('Admin Vendors API error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
