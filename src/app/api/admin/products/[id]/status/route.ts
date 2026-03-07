import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { ProductStatus } from '@prisma/client'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { status } = await request.json()

        const cookieStore = await cookies()
        const supabase = createClient(Promise.resolve(cookieStore) as any)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (profile?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
        }

        // Mapping 'INACTIVE' to 'ARCHIVED' if that's what's intended in the UI
        const finalStatus = status === 'INACTIVE' ? ProductStatus.ARCHIVED : (status as ProductStatus)

        const product = await prisma.product.update({
            where: { id },
            data: { status: finalStatus }
        })

        return NextResponse.json({ message: 'Statut du produit mis à jour', product })
    } catch (error) {
        console.error('Admin product status update error:', error)
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du produit' }, { status: 500 })
    }
}
