import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function getProducts(filters: {
    category?: string;
    vendorId?: string;
    status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
    page?: number;
    limit?: number;
}) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { page = 1, limit = 20, category, vendorId, status = 'ACTIVE' } = filters
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('products')
        .select('*, vendors(storeName, slug), categories(name, slug)', { count: 'exact' })
        .eq('status', status)
        .range(from, to)

    if (category) query = query.eq('categoryId', category)
    if (vendorId) query = query.eq('vendorId', vendorId)

    const { data, error, count } = await query

    if (error) throw error

    return {
        products: data,
        total: count,
        pages: count ? Math.ceil(count / limit) : 0
    }
}

export async function getProductBySlug(slug: string) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('products')
        .select('*, vendors(*), categories(*)')
        .eq('slug', slug)
        .single()

    if (error) return null

    return data
}

export async function createProduct(productData: any) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Unauthorized')

    // Get vendor record for this user
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('userId', session.user.id)
        .single()

    if (!vendor) throw new Error('Only vendors can create products')

    const { data, error } = await supabase
        .from('products')
        .insert([{
            ...productData,
            vendorId: vendor.id,
            status: 'DRAFT'
        }])
        .select()
        .single()

    if (error) throw error

    return data
}

export async function updateProduct(id: string, productData: any) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error

    return data
}
