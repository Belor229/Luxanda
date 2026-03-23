export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single() as any

        if (String(profile?.role || '').toUpperCase() !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const role = searchParams.get('role')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')

        const where: any = {}
        if (role) where.role = role

        const users = await prisma.user.findMany({
            where,
            include: { profile: true },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        })

        const total = await prisma.user.count({ where })

        return NextResponse.json({
            users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Admin users fetch error:', error)
        return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 })
    }
}
