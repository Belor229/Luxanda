import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

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
    const phone = formData.get('phone') as string
    const role = formData.get('role') as string

    // Vendor-specific fields
    const storeName = formData.get('storeName') as string
    const whatsapp = formData.get('whatsapp') as string
    const city = formData.get('city') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const idCard = formData.get('idCard') as File | null
    const selfie = formData.get('selfie') as File | null
    const ifu = formData.get('ifu') as File | null
    const rccm = formData.get('rccm') as File | null

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
    }

    const isVendor = role === 'vendor' || role === 'vendeur'

    // Validate vendor fields server-side
    if (isVendor) {
      if (!storeName?.trim()) return NextResponse.json({ error: 'Le nom de boutique est obligatoire' }, { status: 400 })
      if (!whatsapp?.trim()) return NextResponse.json({ error: 'Le numéro WhatsApp est obligatoire' }, { status: 400 })
      if (!phone?.trim()) return NextResponse.json({ error: 'Le numéro de téléphone est obligatoire pour les vendeurs' }, { status: 400 })
      if (!city?.trim()) return NextResponse.json({ error: 'La ville est obligatoire' }, { status: 400 })
      if (!category?.trim()) return NextResponse.json({ error: 'La catégorie est obligatoire' }, { status: 400 })
      if (!description?.trim() || description.trim().length < 20) {
        return NextResponse.json({ error: 'La description doit contenir au moins 20 caractères' }, { status: 400 })
      }
      if (!idCard) return NextResponse.json({ error: 'La pièce d\'identité est obligatoire' }, { status: 400 })
      if (!selfie) return NextResponse.json({ error: 'Le selfie est obligatoire' }, { status: 400 })

      // Image size limit: 10MB
      const filesToValidate = [idCard, selfie, ifu, rccm].filter(Boolean) as File[]
      for (const file of filesToValidate) {
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: `Le fichier ${file.name} est trop volumineux (max 10 Mo)` }, { status: 400 })
        }
      }
    }

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
          phone: phone,
          role: targetRole,
        },
      },
    })

    if (authError || !authData.user) {
      console.error('Supabase Register Error:', authError)
      return NextResponse.json({ error: authError?.message || 'Erreur lors de la création du compte' }, { status: 400 })
    }

    // If vendor, handle file uploads and create row
    if (isVendor && authData.user) {
      const userId = authData.user.id
      let idCardPath = null
      let selfiePath = null

      try {
        // Upload ID Card
        if (idCard) {
          const idFileName = `${userId}/id_card_${Date.now()}.jpg`
          const { data: idData, error: idError } = await supabase.storage
            .from('identity-documents')
            .upload(idFileName, idCard, { contentType: idCard.type, upsert: true })

          if (idError) throw idError
          idCardPath = idData.path
        }

        // Upload Selfie
        if (selfie) {
          const selfieFileName = `${userId}/selfie_${Date.now()}.jpg`
          const { data: sData, error: sError } = await supabase.storage
            .from('identity-documents')
            .upload(selfieFileName, selfie, { contentType: selfie.type, upsert: true })

          if (sError) throw sError
          selfiePath = sData.path
        }

        let ifuPath = null
        if (ifu) {
          const ifuFileName = `${userId}/ifu_${Date.now()}.jpg`
          const { data: ifuData, error: ifuError } = await supabase.storage
            .from('identity-documents')
            .upload(ifuFileName, ifu, { contentType: ifu.type, upsert: true })
          if (ifuError) throw ifuError
          ifuPath = ifuData.path
        }

        let rccmPath = null
        if (rccm) {
          const rccmFileName = `${userId}/rccm_${Date.now()}.jpg`
          const { data: rccmData, error: rccmError } = await supabase.storage
            .from('identity-documents')
            .upload(rccmFileName, rccm, { contentType: rccm.type, upsert: true })
          if (rccmError) throw rccmError
          rccmPath = rccmData.path
        }

        // Create vendor row
        const { error: vendorError } = await supabase.from('vendors').insert({
          userId: userId,
          storeName: storeName.trim(), // Correct camelCase column name
          description: description.trim(),
          whatsapp: whatsapp.trim(),
          city: city.trim(),
          category: category.trim(),
          id_card_url: idCardPath,
          selfie_url: selfiePath,
          ifu_url: ifuPath,
          rccm_url: rccmPath,
          status: 'PENDING',
        })

        if (vendorError) {
          console.error('Vendor creation error:', vendorError)
        }
      } catch (uploadError: any) {
        console.error('File upload/Vendor creation error:', uploadError)
        // We don't fail the whole registration, but log it. 
        // Admin might need to manually handle or user might need to re-upload.
      }
    }

    // Log legal acceptance (for both user and vendor)
    if (authData.user) {
      try {
        const ip = request.headers.get('x-forwarded-for') || '0.0.0.0'
        await supabase.from('legal_acceptance_logs').insert({
          userId: authData.user.id,
          ip: ip.split(',')[0],
          document_version: 'v1.0',
          user_agent: request.headers.get('user-agent')
        })
      } catch (logError) {
        console.error('Legal log error:', logError)
      }
    }

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
