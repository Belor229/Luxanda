import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import LegalAcceptanceModal from '@/components/LegalAcceptanceModal'



const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Luxanda - Le marché en ligne qui inspire confiance',
  description: 'Luxanda, la marketplace africaine qui inspire confiance. Produits mis en avant, espace vendeurs, programme de récompenses, blog et newsletter.',
  keywords: 'marketplace, afrique, bénin, e-commerce, vendeurs, acheteurs, confiance',
  authors: [{ name: 'Luxanda Team' }],
  creator: 'Luxanda',
  publisher: 'Luxanda',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://luxanda.bj'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Luxanda - Le marché en ligne qui inspire confiance',
    description: 'Luxanda, la marketplace africaine qui inspire confiance. Produits mis en avant, espace vendeurs, programme de récompenses.',
    url: 'https://luxanda.bj',
    siteName: 'Luxanda',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Luxanda - Marketplace Africaine',
      },
    ],
    locale: 'fr_BJ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxanda - Le marché en ligne qui inspire confiance',
    description: 'Luxanda, la marketplace africaine qui inspire confiance.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <script defer data-domain="luxanda.vercel.app" src="https://plausible.io/js/script.js"></script>
      </head>
      <body className={`${inter.className} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Luxanda',
              url: 'https://luxanda.bj',
              logo: 'https://luxanda.vercel.app/images/logo.png',
              description: 'La marketplace africaine qui inspire confiance. Achetez et vendez en toute sécurité au Bénin.',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+229-XX-XX-XX-XX',
                contactType: 'customer support',
                availableLanguage: 'French',
              },
              sameAs: [],
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'BJ',
                addressLocality: 'Cotonou',
              },
            }),
          }}
        />
        <Header />
        <LegalAcceptanceModal />
        {children}
        <Footer />
        <WhatsAppFloat />

      </body>

    </html>
  )
}
