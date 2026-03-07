import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Role } from '@prisma/client'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { role } = await request.json()

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

        if (!Object.values(Role).includes(role as Role)) {
            return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role: role as Role }
        })

        return NextResponse.json({ message: 'Rôle mis à jour', user })
    } catch (error) {
        console.error('Admin user role update error:', error)
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du rôle' }, { status: 500 })
    }
}
