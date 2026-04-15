import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '0.0.0.0'
    const rl = await rateLimit(`register_${ip}`, 3, 3600) // 3 attempts / 1 hour
    if (!rl.success) {
      return NextResponse.json({ error: 'Trop de tentatives d\'inscription. Veuillez réessayer plus tard.' }, { status: 429 })
    }

    const formData = await request.formData()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const role = formData.get('role') as string

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
    }

    const isVendor = role === 'vendor' || role === 'vendeur'

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const targetRole = isVendor ? 'VENDOR' : 'USER'

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName || ''} ${lastName || ''}`.trim(),
          role: targetRole,
        },
      },
    })

    if (authError || !authData.user) {
      console.error('Supabase Register Error:', authError)
      return NextResponse.json({ error: authError?.message || 'Erreur lors de la création du compte' }, { status: 400 })
    }

    const fullName = `${firstName || ''} ${lastName || ''}`.trim()

    // Sync public.users table
    try {
      await prisma.user.upsert({
        where: { id: authData.user.id },
        create: {
          id: authData.user.id,
          email,
          name: fullName || email,
          password: 'PROTECTED_BY_SUPABASE_AUTH',
          role: isVendor ? Role.VENDOR : Role.USER,
        },
        update: {
          role: isVendor ? Role.VENDOR : Role.USER,
          name: fullName || undefined,
        },
      })

      await prisma.userProfile.upsert({
        where: { userId: authData.user.id },
        create: {
          userId: authData.user.id,
          firstName: firstName || null,
          lastName: lastName || null,
        },
        update: {
          firstName: firstName || null,
          lastName: lastName || null,
        },
      })
    } catch (syncErr) {
      console.error('Register: sync user/profile Prisma error:', syncErr)
    }

    // If vendor, create INCOMPLETE vendor record (profile completion done later)
    if (isVendor && authData.user) {
      const userId = authData.user.id
      try {
        await prisma.vendor.upsert({
          where: { userId },
          update: {},
          create: {
            userId,
            storeName: `Boutique de ${fullName}`.trim(),
            status: 'INCOMPLETE',
            admin_notes: 'Inscription email — profil vendeur à compléter',
          },
        })
      } catch (vendorErr) {
        console.error('Register: vendor creation error:', vendorErr)
      }
    }

    // Log legal acceptance
    if (authData.user) {
      try {
        const clientIp = request.headers.get('x-forwarded-for') || '0.0.0.0'
        await supabase.from('legal_acceptance_logs').insert({
          user_id: authData.user.id,
          ip: clientIp.split(',')[0],
          document_version: 'v1.0',
          user_agent: request.headers.get('user-agent')
        })
      } catch (logError) {
        console.error('Legal log error:', logError)
      }
    }

    const redirectPath = authData.session
      ? (isVendor ? '/vendor/dashboard' : '/')
      : '/login?registered=1'

    return NextResponse.json({
      token: authData.session?.access_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: authData.user.user_metadata.full_name,
        role: targetRole,
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
