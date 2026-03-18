import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEMO_PRODUCTS } from '@/lib/demo-data'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier le rôle admin en BDD
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    // Créer une catégorie par défaut si elle n'existe pas
    const category = await prisma.category.upsert({
      where: { name: 'Électronique' },
      update: {},
      create: { 
        name: 'Électronique',
        description: 'Produits high-tech et gadgets'
      }
    })

    // Créer un vendeur de démonstration si nécessaire
    // Note: On utilise l'ID de l'admin pour simplifier si on ne peut pas créer d'auth user facilement via API sans service role
    // Mais ici on va essayer de trouver un vendeur existant ou d'en créer un propre
    let vendor = await prisma.vendor.findFirst({
        where: { status: 'APPROVED' }
    })

    if (!vendor) {
        vendor = await prisma.vendor.create({
            data: {
                userId: authUser.id,
                storeName: 'Luxanda Official Store',
                description: 'Boutique officielle de démonstration',
                status: 'APPROVED',
                trial_start_date: new Date(),
                trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            }
        })
        
        // Mettre à jour le rôle de l'utilisateur en VENDOR s'il ne l'est pas
        await prisma.user.update({
            where: { id: authUser.id },
            data: { role: 'ADMIN' } // On garde ADMIN car c'est l'admin qui fait le seed
        })
    }

    // Insérer les produits
    let createdCount = 0
    for (const p of DEMO_PRODUCTS.slice(0, 12)) {
      await prisma.product.create({
        data: {
          vendorId: vendor.id,
          name: p.title,
          description: p.description,
          price: p.price,
          status: 'ACTIVE',
          images: p.images,
          categoryId: category.id,
          quantity: p.stock || 10
        }
      })
      createdCount++
    }

    return NextResponse.json({ 
      success: true, 
      message: `${createdCount} produits de démonstration créés`,
      vendorId: vendor.id
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Erreur lors du seeding', details: String(error) }, { status: 500 })
  }
}
