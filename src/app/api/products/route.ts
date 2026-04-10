import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { productSchema } from '@/lib/validations'


export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured') === 'true'

    const from = (page - 1) * limit
    const to = from + limit - 1

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const city = searchParams.get('city')

    let query = supabase
      .from('products')
      .select(`
        *,
        vendor:vendors!inner(store_name, user_id, city),
        category:categories(name)
      `, { count: 'exact' })
      .eq('status', 'ACTIVE')

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (featured) {
      query = query.eq('featured', true)
    }

    if (minPrice) {
      query = query.gte('price', minPrice)
    }

    if (maxPrice) {
      query = query.lte('price', maxPrice)
    }

    if (city) {
      query = query.eq('vendor.city', city)
    }

    const { data: products, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return NextResponse.json({
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    // Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || '0.0.0.0'
    const { rateLimit } = await import('@/lib/rate-limit')
    const rl = await rateLimit(`product_create_${session.user.id}`, 10, 3600) // 10 products / hour
    if (!rl.success) {
      return NextResponse.json({ error: 'Limite de création de produits atteinte. Veuillez réessayer plus tard.' }, { status: 429 })
    }

    // Check if user is a seller and approved
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, status, trial_end_date')
      .eq('user_id', session.user.id)
      .single()

    if (!vendor) {
      return NextResponse.json({ error: 'Profil vendeur requis.' }, { status: 403 })
    }

    if (vendor.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Votre compte doit être approuvé pour publier des produits.' }, { status: 403 })
    }

    if (!vendor.trial_end_date || new Date(vendor.trial_end_date) < new Date()) {
      return NextResponse.json({ error: 'Votre période d\'essai a expiré.' }, { status: 403 })
    }

    if (validatedData.price <= 0) {
      return NextResponse.json({ error: 'Le prix doit être supérieur à 0' }, { status: 400 })
    }

    // Create product in Supabase
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        vendor_id: vendor.id,
        category_id: validatedData.category_id,
        image_urls: validatedData.image_urls,
        quantity: validatedData.stock,
        status: 'ACTIVE',
        featured: false
      })

      .select()
      .single()

    if (error) throw error

    return NextResponse.json(product)
  } catch (error) {
    console.error('Create product API error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du produit' }, { status: 500 })
  }
}