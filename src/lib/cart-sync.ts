import { createClient } from '@/utils/supabase/client'
import { CartItem } from '@/store/useCartStore'

/**
 * Synchronize local cart items with Supabase cart_items table.
 */
export async function syncCartWithSupabase(localItems: CartItem[]) {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session || localItems.length === 0) return

    const userId = session.user.id

    try {
        // 1. Fetch current DB cart to avoid duplicates or merge quantities
        const { data: dbItems } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', userId)

        // 2. Prepare items for upsert
        // We using UUIDs, so localItems.id should be the product UUID string.
        const itemsToSync = localItems.map(item => ({
            user_id: userId,
            product_id: item.id as string,
            quantity: item.quantity
        }))

        // 3. Upsert into Supabase
        const { error } = await supabase
            .from('cart_items')
            .upsert(itemsToSync, { onConflict: 'user_id,product_id' })

        if (error) throw error

    } catch (error) {
        console.error('Cart sync error:', error)
    }
}
