import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/account/', '/vendor/', '/profile/', '/dashboard/'],
            },
        ],
        sitemap: 'https://luxanda.bj/sitemap.xml',
    }
}
