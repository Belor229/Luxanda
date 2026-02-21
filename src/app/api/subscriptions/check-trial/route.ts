import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Check if user already had a trial by checking auth.users email
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      // Check if they had a trial subscription
      const { data: trialSub } = await supabase
        .from('subscriptions')
        .select('trial_end_date')
        .eq('userId', existingUser.id)
        .eq('amount', 0)
        .single()

      if (trialSub?.trial_end_date) {
        return NextResponse.json({ 
          hasHadTrial: true,
          trialEndDate: trialSub.trial_end_date
        })
      }
    }

    return NextResponse.json({ hasHadTrial: false })

  } catch (error) {
    console.error('Check trial error:', error)
    return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 })
  }
}
