import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const { status } = await request.json()

        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single() as any

        if (profile?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
        }

        if (!['APPROVED', 'PENDING', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
        }

        const product = await prisma.product.update({
            where: { id },
            data: { status: status as any }
        })

        return NextResponse.json({ message: 'Statut du produit mis à jour', product })
    } catch (error) {
        console.error('Admin product status update error:', error)
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du produit' }, { status: 500 })
    }
}
