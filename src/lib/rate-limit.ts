import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

/**
 * Poor man's rate limit using Supabase table.
 * Suitable for low-traffic MVP sensitive endpoints.
 */
export async function rateLimit(key: string, limit: number, durationSeconds: number): Promise<{ success: boolean; remaining: number }> {
    const cookieStore = cookies()
    // Use service role if possible for rate limiting to avoid RLS complexities, 
    // but here we use the standard server client.
    const supabase = createClient(cookieStore)

    const now = new Date()
    const expiresAt = new Date(now.getTime() + durationSeconds * 1000)

    try {
        // 1. Clean up expired entries (optional, can be a cron job)
        // For simplicity, we just check and update.

        const { data, error } = await supabase
            .from('rate_limits')
            .select('*')
            .eq('key', key)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Rate limit select error:', error)
            return { success: true, remaining: limit } // Fail open
        }

        if (!data) {
            // First hit
            await supabase.from('rate_limits').insert({
                key,
                hits: 1,
                expires_at: expiresAt.toISOString()
            })
            return { success: true, remaining: limit - 1 }
        }

        const recordExpiresAt = new Date(data.expires_at)

        if (now > recordExpiresAt) {
            // Expired, reset
            await supabase.from('rate_limits').update({
                hits: 1,
                expires_at: expiresAt.toISOString()
            }).eq('key', key)
            return { success: true, remaining: limit - 1 }
        }

        if (data.hits >= limit) {
            // Rate limited
            return { success: false, remaining: 0 }
        }

        // Increment hits
        await supabase.from('rate_limits').update({
            hits: data.hits + 1
        }).eq('key', key)

        return { success: true, remaining: limit - (data.hits + 1) }

    } catch (err) {
        console.error('Rate limit error:', err)
        return { success: true, remaining: limit } // Fail open on error
    }
}
