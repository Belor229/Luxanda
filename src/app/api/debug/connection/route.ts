import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
    const results: any = {
        prisma: { status: 'pending' },
        supabase: { status: 'pending' },
        env: {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            // Hide key partially
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
            DATABASE_URL: process.env.DATABASE_URL ? 'Present' : 'Missing',
        }
    }

    try {
        // Test Prisma
        const userCount = await prisma.user.count()
        results.prisma = { status: 'ok', userCount }
    } catch (error: any) {
        results.prisma = { status: 'error', message: error.message, code: error.code }
    }

    try {
        // Test Supabase
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })

        // Auth check (public config)
        const { data: authConfig, error: authError } = await supabase.auth.getSession()

        results.supabase = {
            status: error ? 'error' : 'ok',
            message: error?.message,
            authStatus: authError ? 'error' : 'ok',
            authMessage: authError?.message
        }
    } catch (error: any) {
        results.supabase = { status: 'crashed', message: error.message }
    }

    return NextResponse.json(results)
}
