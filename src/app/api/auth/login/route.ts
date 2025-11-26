import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: authError?.message || 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      // If profile doesn't exist, create a basic one
      const { data: newProfile } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          name: authData.user.email?.split('@')[0] || 'User',
          role: 'USER',
        })
        .select('id, email, name, role')
        .single()

      if (newProfile) {
        return NextResponse.json({
          token: authData.session?.access_token,
          user: {
            id: newProfile.id,
            email: newProfile.email,
            name: newProfile.name,
            role: newProfile.role || 'USER',
          },
        })
      }
    }

    // Determine redirect path based on role
    let redirectPath = '/'
    if (profile?.role === 'ADMIN') {
      redirectPath = '/admin'
    } else if (profile?.role === 'VENDOR') {
      redirectPath = '/vendor/dashboard'
    }

    return NextResponse.json({
      token: authData.session?.access_token,
      user: {
        id: profile?.id || authData.user.id,
        email: profile?.email || authData.user.email,
        name: profile?.name || authData.user.email?.split('@')[0] || 'User',
        role: profile?.role || 'USER',
      },
      redirectPath,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}
