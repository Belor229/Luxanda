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

    let query = supabase
      .from('products')
      .select(`
        *,
        vendor:vendors(store_name, userId),
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

    // Check if user is a seller
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, verified')
      .eq('userId', session.user.id)
      .single()

    if (!vendor) {
      return NextResponse.json({ error: 'Profil vendeur requis.' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    // Create product in Supabase
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        vendorId: vendor.id,
        categoryId: validatedData.category_id,
        image_urls: validatedData.image_urls,
        quantity: validatedData.stock,
        status: vendor.verified ? 'ACTIVE' : 'DRAFT',
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