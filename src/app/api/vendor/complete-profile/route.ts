import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const profileSchema = z.object({
  storeName: z.string().min(2, 'Le nom de boutique doit contenir au moins 2 caractères').max(100),
  whatsapp: z.string().min(8, 'Numéro WhatsApp invalide'),
  city: z.string().min(2, 'Veuillez sélectionner une ville'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères').max(1000),
  fullName: z.string().min(2, 'Le nom complet est requis'),
  category: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userId = session.user.id

    // Check that the user is a vendor
    const vendor = await prisma.vendor.findUnique({ where: { userId } })
    if (!vendor) {
      return NextResponse.json({ error: 'Compte vendeur non trouvé' }, { status: 404 })
    }

    if (vendor.status !== 'INCOMPLETE') {
      return NextResponse.json({ error: 'Votre profil a déjà été soumis' }, { status: 400 })
    }

    const body = await request.json()
    const validated = profileSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({
        error: 'Données invalides',
        details: validated.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const { storeName, whatsapp, city, description, fullName, category } = validated.data

    // Handle logo upload if present (sent as base64 or URL)
    let logoUrl = body.logoUrl || null

    // Update vendor profile and set status to PENDING
    await prisma.vendor.update({
      where: { userId },
      data: {
        storeName: storeName.trim(),
        whatsapp: whatsapp.trim(),
        city: city.trim(),
        description: description.trim(),
        category: category?.trim() || null,
        logo_url: logoUrl,
        status: 'PENDING',
        admin_notes: 'Profil vendeur complété — en attente de validation admin',
      },
    })

    // Update user name
    await prisma.user.update({
      where: { id: userId },
      data: { name: fullName.trim() },
    })

    return NextResponse.json({
      success: true,
      message: 'Votre profil a été soumis pour validation. Vous recevrez une réponse sous 24-48h.',
    })
  } catch (error: any) {
    console.error('Complete profile error:', error)
    return NextResponse.json(
      { error: `Erreur lors de la soumission du profil: ${error.message || 'Erreur inconnue'}` },
      { status: 500 }
    )
  }
}
