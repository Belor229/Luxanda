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

    // Utiliser la fonction centralisée de seeding
    const result = await seedDemoProducts(authUser.id)

    if (!result.success) {
      throw new Error(result.error)
    }

    return NextResponse.json({ 
      success: true, 
      message: result.message
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Erreur lors du seeding', details: String(error) }, { status: 500 })
  }
}
