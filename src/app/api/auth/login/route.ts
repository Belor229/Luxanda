import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '0.0.0.0'
    const rl = await rateLimit(`login_${ip}`, 5, 900) // 5 attempts / 15 min
    if (!rl.success) {
      return NextResponse.json({ error: 'Trop de tentatives. Veuillez réessayer plus tard.' }, { status: 429 })
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      console.error('Supabase Auth Error:', authError)
      return NextResponse.json(
        { error: authError?.message || 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Get user profile from database using Supabase Client
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      // Even if profile fetch fails, we have the auth user, but we need the role
    }

    const role = profile?.role || 'USER'

    // Determine redirect path based on role
    let redirectPath = '/' // Default for client
    const normalizedRole = String(role).toUpperCase()
    if (normalizedRole === 'ADMIN') {
      redirectPath = '/admin'
    } else if (normalizedRole === 'VENDOR') {
      redirectPath = '/vendor/dashboard'
    } else {
      redirectPath = '/' // Buyers go to home
    }

    return NextResponse.json({
      token: authData.session?.access_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: profile?.full_name || authData.user.email?.split('@')[0] || 'User',
        role: role,
      },
      redirectPath,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: `Erreur lors de la connexion: ${error.message || 'Erreur inconnue'}` },
      { status: 500 }
    )
  }
}
