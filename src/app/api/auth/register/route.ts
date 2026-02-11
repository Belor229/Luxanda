import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

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

    // Debug logging
    console.log('Register attempt for:', email)

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
      console.error('Supabase Register Error:', authError)
      return NextResponse.json(
        { error: authError?.message || 'Erreur lors de la création du compte' },
        { status: 400 }
      )
    }

    // Map role from form to database role
    // Only allow USER or VENDOR registration. ADMIN must be created manually/seeded.
    let dbRole: Role = Role.USER
    if (role === 'vendor' || role === 'VENDOR') {
      dbRole = Role.VENDOR
    }

    // Create user profile in database using Prisma (bypassing RLS)
    // We strive to keep public.users in sync with auth.users
    let userProfile;
    try {
      userProfile = await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          name: `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0],
          password: 'SUPABASE_AUTH', // Managed by Supabase
          role: dbRole,
          profile: {
            create: {
              firstName: firstName || undefined,
              lastName: lastName || undefined,
              phone: phone || undefined,
            }
          }
        },
        include: {
          profile: true
        }
      })
    } catch (error: any) {
      console.error('Prisma create error:', error)
      // Check if user already exists (race condition or previous attempt)
      if (error.code === 'P2002') {
        userProfile = await prisma.user.findUnique({
          where: { id: authData.user.id },
          include: { profile: true }
        })
      } else {
        throw error
      }
    }

    if (!userProfile) {
      console.error('Failed to create or retrieve user profile')
      return NextResponse.json(
        { error: 'Erreur: Impossible de créer le profil utilisateur (Doublon ou Erreur DB)' },
        { status: 500 }
      )
    }

    // Determine redirect path based on role
    let redirectPath = '/'
    if (userProfile.role === Role.ADMIN) {
      redirectPath = '/admin'
    } else if (userProfile.role === Role.VENDOR) {
      redirectPath = '/vendor/dashboard'
    }

    return NextResponse.json({
      token: authData.session?.access_token,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
      },
      redirectPath,
    })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: `Erreur lors de l'inscription: ${error.message || 'Erreur inconnue'}` },
      { status: 500 }
    )
  }
}
