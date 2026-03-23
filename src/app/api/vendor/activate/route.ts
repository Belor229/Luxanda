import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // Get Vendor
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, status')
      .eq('userId', session.user.id)
      .single()

    if (vendorError || !vendor) {
      return NextResponse.json({ error: 'Vendeur non trouvé' }, { status: 404 })
    }

    if (vendor.status !== 'APPROVED_REGISTRATION') {
      return NextResponse.json({ error: 'Votre dossier doit être validé par l\'admin avant l\'activation.' }, { status: 400 })
    }

    // Update to PENDING_ACTIVATION
    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        status: 'PENDING_ACTIVATION',
        activation_requested_at: new Date().toISOString()
      })
      .eq('id', vendor.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, message: 'Demande d\'activation envoyée' })

  } catch (error: any) {
    console.error('Activation error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'activation' }, { status: 500 })
  }
}
