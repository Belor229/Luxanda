import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(5).max(1000)
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: params.id },
      include: {
        user: {
          select: {
            name: true,
            profile: { select: { avatar: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des avis' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await prisma.review.findFirst({
        where: {
            productId: params.id,
            userId: session.user.id
        }
    })

    if (existingReview) {
        return NextResponse.json({ error: 'Vous avez déjà laissé un avis pour ce produit' }, { status: 400 })
    }

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        productId: params.id,
        userId: session.user.id,
        rating: validatedData.rating,
        title: validatedData.title,
        comment: validatedData.comment,
        verified: true // On peut affiner cela plus tard si on vérifie l'achat
      }
    })

    return NextResponse.json(review)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 })
    }
    console.error('Review POST error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de l\'avis' }, { status: 500 })
  }
}
