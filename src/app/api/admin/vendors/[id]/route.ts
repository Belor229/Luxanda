import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Role } from '@prisma/client'

// Force dynamic since we use cookies
export const dynamic = 'force-dynamic'

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        const body = await request.json()
        const { status } = body

        if (!status || !['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING'].includes(status)) {
            return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
        }

        const updatedVendor = await prisma.vendor.update({
            where: { id: params.id },
            data: { status }
        })

        // If approved, maybe ensure User role is VENDOR? (It should optionally be USER until aproved?)
        // But currently we set VENDOR on registration if checkbox selected.

        // Send email notification? (Future enhancement)

        return NextResponse.json(updatedVendor)
    } catch (error) {
        console.error('Admin Vendor Update API error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
