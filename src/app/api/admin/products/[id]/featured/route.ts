import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { assertAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const gate = await assertAdmin(authUser, supabase)
    if (!gate.ok) {
      return NextResponse.json({ error: gate.message }, { status: gate.status })
    }

    const body = await request.json()
    const featured = body.featured
    if (typeof featured !== 'boolean') {
      return NextResponse.json({ error: 'Le champ featured (boolean) est requis' }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: { featured },
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Admin featured update error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}
