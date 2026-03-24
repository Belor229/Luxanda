export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        let { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

        if (error || !profile) {
            console.warn('Profile not found in public.users, attempting to auto-create...')
            // Auto-create from session if missing
            const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert([{
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name || session.user.email,
                    password: 'PROTECTED_BY_SUPABASE_AUTH',
                    role: (session.user.user_metadata?.role as any) || 'USER'
                }])
                .select()
                .single()
            
            if (createError) {
                console.error('Auto-create profile failed:', createError)
                throw new Error('Impossible de charger ou de créer votre profil.')
            }
            profile = newProfile
        }

        // Si une boutique existe en attente / active, exposer le rôle VENDOR (CDC : droits vendeur)
        const vendor = await prisma.vendor
            .findUnique({
                where: { userId: session.user.id },
                select: { id: true, status: true },
            })
            .catch(() => null)

        const roleUpper = String(profile.role || 'USER').toUpperCase()
        const payload =
            vendor && roleUpper !== 'ADMIN'
                ? {
                      ...profile,
                      role: 'VENDOR',
                      vendor_status: vendor.status,
                  }
                : { ...profile, vendor_status: vendor?.status }

        return NextResponse.json(payload)
    } catch (error) {
        console.error('Fetch me error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
