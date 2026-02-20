import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // Check admin role from users table
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (!profile || profile.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 })
        }

        // Fetch counts
        const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })
        const { count: totalVendors } = await supabase.from('vendors').select('*', { count: 'exact', head: true })
        const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true })
        const { count: pendingVendors } = await supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'PENDING')

        return NextResponse.json({
            totalUsers: totalUsers || 0,
            totalVendors: totalVendors || 0,
            totalProducts: totalProducts || 0,
            pendingVendors: pendingVendors || 0
        })
    } catch (error) {
        console.error('Admin Stats API error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
