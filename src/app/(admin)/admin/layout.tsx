import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
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

    // Role verification from database
    const { data: profile, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

    if (error || !profile || profile.role?.toUpperCase() !== 'ADMIN') {
        console.error('Admin Layout: Unauthorized access attempt or error:', error)
        redirect('/')
    }

    return <AdminLayoutClient>{children}</AdminLayoutClient>
}
