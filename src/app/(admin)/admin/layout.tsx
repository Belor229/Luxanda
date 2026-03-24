import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    // Rôle admin : Supabase public.users puis Prisma (même base)
    const { data: profile, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()

    let isAdmin = profile?.role?.toUpperCase() === 'ADMIN'
    if (!isAdmin) {
        const pu = await prisma.user
            .findUnique({
                where: { id: session.user.id },
                select: { role: true },
            })
            .catch(() => null)
        isAdmin = pu?.role?.toUpperCase() === 'ADMIN'
    }

    if (!isAdmin) {
        console.error('Admin Layout: accès refusé', error)
        redirect('/')
    }

    return <AdminLayoutClient>{children}</AdminLayoutClient>
}
