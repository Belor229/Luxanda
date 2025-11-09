import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Test connection by getting the current user (if authenticated)
    const { data, error } = await supabase.auth.getUser()

    if (error && error.message !== 'Auth session missing!') {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data: data
    })
  } catch (error) {
    console.error('Supabase connection error:', error)
    return NextResponse.json({
      success: false,
      message: 'Supabase connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
