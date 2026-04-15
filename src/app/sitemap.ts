import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://luxanda.com' // À adapter selon le domaine final

  // 1. Pages statiques
  const staticPages = [
    '',
    '/marketplace',
    '/products',
    '/about',
    '/contact',
    '/faq',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // 2. Catégories dynamiques
  const categories = await prisma.category.findMany({ select: { id: true, updatedAt: true } })
  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/products?categoryId=${cat.id}`,
    lastModified: cat.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // 3. Produits dynamiques
  const products = await prisma.product.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, updatedAt: true }
  })
  const productPages = products.map((prod) => ({
    url: `${baseUrl}/products/${prod.id}`,
    lastModified: prod.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
