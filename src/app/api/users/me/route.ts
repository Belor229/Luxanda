import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, email: true, name: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Me API error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
