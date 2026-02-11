import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// Force dynamic since we use cookies
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')

    const skip = (page - 1) * limit

    const where: any = {
      status: 'ACTIVE' // Ensure we only show active products
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          vendor: {
            select: { storeName: true, userId: true }
          },
          category: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Check role, for now assume we fetch it from DB or metadata
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const role = userProfile?.role?.toUpperCase()

    if (role !== 'VENDOR' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé. Rôle Vendeur requis.' }, { status: 403 })
    }

    const body = await request.json()

    // Check if the user is a vendor and has a vendor profile
    let vendorId = body.vendorId
    if (role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id }
      })
      if (!vendor) {
        return NextResponse.json({ error: 'Profil vendeur introuvable.' }, { status: 404 })
      }
      vendorId = vendor.id
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        vendorId: vendorId, // Must be provided or inferred
        categoryId: body.categoryId,
        images: body.images || [],
        quantity: parseInt(body.quantity || '0'),
        status: 'DRAFT', // Default to draft
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Create product API error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du produit' }, { status: 500 })
  }
}