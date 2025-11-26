import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, password, role } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        },
      },
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Erreur lors de la création du compte' },
        { status: 400 }
      )
    }

    // Map role from form to database role
    let dbRole = 'USER'
    if (role === 'vendor') {
      dbRole = 'VENDOR'
    } else if (role === 'admin') {
      dbRole = 'ADMIN'
    }

    // Create user profile in database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        name: `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0],
        role: dbRole,
      })
      .select('id, email, name, role')
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Try to get existing user
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('id', authData.user.id)
        .single()

      if (existingUser) {
        return NextResponse.json({
          token: authData.session?.access_token,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role || 'USER',
          },
        })
      }

      return NextResponse.json(
        { error: 'Erreur lors de la création du profil utilisateur' },
        { status: 500 }
      )
    }

    // Create user profile details if provided
    if (firstName || lastName || phone) {
      await supabase
        .from('user_profiles')
        .insert({
          userId: authData.user.id,
          firstName: firstName || null,
          lastName: lastName || null,
          phone: phone || null,
        })
    }

    // Determine redirect path based on role
    let redirectPath = '/'
    if (dbRole === 'ADMIN') {
      redirectPath = '/admin'
    } else if (dbRole === 'VENDOR') {
      redirectPath = '/vendor/dashboard'
    }

    return NextResponse.json({
      token: authData.session?.access_token,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role || 'USER',
      },
      redirectPath,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}
