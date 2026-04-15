import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const role = searchParams.get('role') || 'USER'
    const next = searchParams.get('next') || '/'

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Exchange code for session
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (authError || !session) {
      console.error('OAuth callback error:', authError)
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }

    const user = session.user
    const normalizedRole = role.toUpperCase() === 'VENDOR' ? 'VENDOR' : 'USER'
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || ''

    // Update user metadata with role
    await supabase.auth.updateUser({
      data: { role: normalizedRole }
    })

    // Sync to public.users table via Prisma
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email!,
          name: fullName || user.email!,
          password: 'OAUTH_GOOGLE',
          role: normalizedRole === 'VENDOR' ? Role.VENDOR : Role.USER,
        },
        update: {
          name: fullName || undefined,
          role: normalizedRole === 'VENDOR' ? Role.VENDOR : Role.USER,
        },
      })

      // Create user profile
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          firstName: user.user_metadata?.given_name || fullName.split(' ')[0] || null,
          lastName: user.user_metadata?.family_name || fullName.split(' ').slice(1).join(' ') || null,
          avatar: user.user_metadata?.avatar_url || null,
        },
        update: {
          firstName: user.user_metadata?.given_name || undefined,
          lastName: user.user_metadata?.family_name || undefined,
          avatar: user.user_metadata?.avatar_url || undefined,
        },
      })

      // If vendor, create INCOMPLETE vendor record
      if (normalizedRole === 'VENDOR') {
        const existingVendor = await prisma.vendor.findUnique({
          where: { userId: user.id },
        })

        if (!existingVendor) {
          await prisma.vendor.create({
            data: {
              userId: user.id,
              storeName: `Boutique de ${fullName}`.trim(),
              status: 'INCOMPLETE',
              admin_notes: 'Inscription via Google OAuth — profil à compléter',
            },
          })
        }
      }
    } catch (syncErr) {
      console.error('OAuth callback: user sync error:', syncErr)
      // Continue — the user is authenticated but sync failed
    }

    // Determine redirect
    let redirectPath = '/'
    if (normalizedRole === 'VENDOR') {
      redirectPath = '/vendor/dashboard'
    } else if (normalizedRole === 'ADMIN') {
      redirectPath = '/admin'
    }

    // Use 'next' param if it was an explicit redirect, otherwise role-based
    const finalRedirect = next !== '/' ? next : redirectPath

    return NextResponse.redirect(new URL(finalRedirect, request.url))
  } catch (error) {
    console.error('OAuth callback unexpected error:', error)
    return NextResponse.redirect(new URL('/login?error=unexpected', request.url))
  }
}
