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
        const { role } = await request.json()

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

        if (!['USER', 'VENDOR', 'ADMIN'].includes(role)) {
            return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role }
        })

        return NextResponse.json({ message: 'Rôle mis à jour', user })
    } catch (error) {
        console.error('Admin user role update error:', error)
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du rôle' }, { status: 500 })
    }
}
