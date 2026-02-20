'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/useCartStore'
import { syncCartWithSupabase } from '@/lib/cart-sync'
import { createClient } from '@/utils/supabase/client'

export default function CartSync() {
    const { items } = useCartStore()
    const supabase = createClient()

    useEffect(() => {
        // Run sync when items change or session is established
        const handleSync = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session && items.length > 0) {
                await syncCartWithSupabase(items)
            }
        }

        handleSync()

        // Listen for auth changes to trigger sync on login
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN' && items.length > 0) {
                    syncCartWithSupabase(items)
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [items, supabase])

    return null // Renderless component
}
