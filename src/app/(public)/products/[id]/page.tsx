import { Metadata, ResolvingMetadata } from 'next'
import { prisma } from '@/lib/prisma'
import ProductDetail from './ProductDetail'

interface Props {
    params: Promise<{ id: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params

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

    const description = product.description?.substring(0, 160) || ''
    const imageUrl = product.images?.[0] || '/images/og-image.jpg'

    return {
        title: `${product.name} | Luxanda`,
        description,
        keywords: `${product.name}, ${product.category?.name}, Luxanda, acheter, Bénin`,
        openGraph: {
            title: `${product.name} | Luxanda`,
            description,
            url: `https://luxanda.bj/products/${id}`,
            siteName: 'Luxanda',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                },
                ...previousImages
            ],
            locale: 'fr_BJ',
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} | Luxanda`,
            description,
            images: [imageUrl],
        },
    }
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params

    // Fetch product for JSON-LD
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            vendor: true
        }
    })

    if (!product) return <ProductDetail id={id} />

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images,
        description: product.description,
        brand: {
            '@type': 'Brand',
            name: product.vendor?.storeName || 'Luxanda'
        },
        offers: {
            '@type': 'Offer',
            url: `https://luxanda.bj/products/${id}`,
            priceCurrency: 'XOF',
            price: product.price,
            availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: product.vendor?.storeName || 'Luxanda'
            }
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetail id={id} />
        </>
    )
}
