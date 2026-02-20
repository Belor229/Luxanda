import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, password, role } = body

    // Vendor-specific fields
    const { storeName, whatsapp, city, category, description } = body

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

    const isVendor = role === 'vendor' || role === 'vendeur'

    // Validate vendor fields server-side
    if (isVendor) {
      if (!storeName?.trim()) {
        return NextResponse.json({ error: 'Le nom de boutique est obligatoire' }, { status: 400 })
      }
      if (!whatsapp?.trim()) {
        return NextResponse.json({ error: 'Le numéro WhatsApp est obligatoire pour les vendeurs' }, { status: 400 })
      }
      if (!city?.trim()) {
        return NextResponse.json({ error: 'La ville est obligatoire' }, { status: 400 })
      }
      if (!category?.trim()) {
        return NextResponse.json({ error: 'La catégorie est obligatoire' }, { status: 400 })
      }
      if (!description?.trim() || description.trim().length < 20) {
        return NextResponse.json({ error: 'La description doit contenir au moins 20 caractères' }, { status: 400 })
      }
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Map role to Postgres enum values: 'USER' or 'VENDOR'
    const targetRole = isVendor ? 'VENDOR' : 'USER'

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName || ''} ${lastName || ''}`.trim(),
          phone: phone,
          role: targetRole,
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

    // If vendor, create the vendor row (this also triggers the 60-day trial subscription via DB trigger)
    if (isVendor) {
      const { error: vendorError } = await supabase.from('vendors').insert({
        userId: authData.user.id,
        store_name: storeName.trim(),
        description: description.trim(),
        whatsapp: whatsapp.trim(),
        city: city.trim(),
        category: category.trim(),
        status: 'PENDING', // Will be set to APPROVED by the trigger
      })

      if (vendorError) {
        console.error('Vendor creation error:', vendorError)
        // Don't fail the signup — the user account is already created
      }
    }

    // Determine redirect path based on role
    const redirectPath = isVendor ? '/vendor/dashboard' : '/'

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
