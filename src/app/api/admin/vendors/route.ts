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

        // Check admin role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (!profile || profile.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        let query = supabase
            .from('vendors')
            .select(`
                *,
                profile:users(full_name, avatar_url, phone)
            `)
            .order('created_at', { ascending: false })

        if (status) {
            query = query.eq('status', status.toUpperCase())
        }

        const { data: vendors, error } = await query

        if (error) throw error

        // Transform to match UI expectations
        const formattedVendors = vendors.map(v => ({
            id: v.id,
            storeName: v.store_name,
            status: v.status,
            verified: v.verified,
            userId: v.userId,
            createdAt: v.created_at,
            user: {
                email: v.profile?.email || 'N/A', // email might be missing if not selected
                name: v.profile?.full_name,
                profile: { phone: v.profile?.phone }
            },
            _count: { products: 0 }
        }))

        return NextResponse.json(formattedVendors)
    } catch (error) {
        console.error('Admin Vendors API error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
