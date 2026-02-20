import { Metadata, ResolvingMetadata } from 'next'
import { prisma } from '@/lib/prisma'
import ProductDetail from './ProductDetail'

interface Props {
    params: { id: string }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = params.id

    // Fetch product data
    const product = await prisma.product.findUnique({
        where: { id: id },
        include: {
            category: true,
            vendor: true
        }
    })

    const previousImages = (await parent).openGraph?.images || []

    if (!product) {
        return {
            title: 'Produit non trouvé | Luxanda',
        }
    }

    return {
        title: `${product.name} | Luxanda`,
        description: product.description?.substring(0, 160),
        openGraph: {
            title: `${product.name} | Luxanda`,
            description: product.description?.substring(0, 160),
            images: product.images?.[0] ? [product.images[0], ...previousImages] : previousImages,
        },
    }
}

export default async function ProductPage({ params }: Props) {
    // Pass the ID to the client component or fetch data here
    return <ProductDetail id={params.id} />
}
