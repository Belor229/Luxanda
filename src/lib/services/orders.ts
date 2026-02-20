import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function createOrder(orderData: {
    seller_id: string;
    total_amount: number;
    shipping_address: string;
    phone_contact: string;
    items: { product_id: string; quantity: number; price: number }[];
}) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Unauthorized')

    // Transaction-like approach (manual sequence for order + items)
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
            buyer_id: session.user.id,
            seller_id: orderData.seller_id,
            total_amount: orderData.total_amount,
            shipping_address: orderData.shipping_address,
            phone_contact: orderData.phone_contact,
            status: 'pending'
        }])
        .select()
        .single()

    if (orderError) throw orderError

    const itemsToInsert = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_order: item.price
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert)

    if (itemsError) throw itemsError

    return order
}

export async function getBuyerOrders() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('orders')
        .select('*, vendors(storeName), order_items(*, products(title, image_urls))')
        .eq('buyer_id', session.user.id)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function getSellerOrders() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Unauthorized')

    // Get vendor id
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('userId', session.user.id)
        .single()

    if (!vendor) throw new Error('Not a vendor')

    const { data, error } = await supabase
        .from('orders')
        .select('*, users(full_name), order_items(*, products(*))')
        .eq('seller_id', vendor.id)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function updateOrderStatus(orderId: string, status: 'confirmed' | 'delivered' | 'cancelled') {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single()

    if (error) throw error
    return data
}
