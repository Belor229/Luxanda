import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

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

    // Debug logging
    console.log('Login attempt for:', email)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

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

    // Get user profile from database using Prisma
    let profile = await prisma.user.findUnique({
      where: { id: authData.user.id }
    })

    if (!profile) {
      // If profile doesn't exist (legacy user?), create a basic one
      try {
        profile = await prisma.user.create({
          data: {
            id: authData.user.id,
            email: authData.user.email!,
            name: authData.user.email?.split('@')[0] || 'User',
            password: 'SUPABASE_AUTH', // Managed by Supabase
            role: Role.USER,
          }
        })
      } catch (e) {
        console.error('Error creating missing profile:', e)
      }
    }

    // Determine redirect path based on role
    let redirectPath = '/cart' // Default for USER (acheteur)
    if (profile?.role === Role.ADMIN) {
      redirectPath = '/admin'
    } else if (profile?.role === Role.VENDOR) {
      redirectPath = '/vendor/dashboard'
    } else if (profile?.role === Role.USER) {
      redirectPath = '/cart' // Acheteur vers panier
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
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: `Erreur lors de la connexion: ${error.message || 'Erreur inconnue'}` },
      { status: 500 }
    )
  }
}
