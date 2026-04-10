import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
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
  description: 'Luxanda - Marketplace au Bénin. Achetez et vendez en toute confiance. Vendeurs vérifiés, produits locaux, paiement sécurisé Kkiapay. Livraison en cours de lancement.',
  keywords: 'marketplace Bénin, e-commerce Bénin, Cotonou, Porto-Novo, Parakou, achats en ligne, vendre au Bénin, Kkiapay, Mobile Money, marketplace africaine, confiance, sécurité',
  authors: [{ name: 'Luxanda Team' }],
  creator: 'Luxanda',
  publisher: 'Luxanda',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://luxanda.vercel.app'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-196x196.png', sizes: '196x196', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  manifest: '/manifest.json',
  themeColor: '#FF6B35',
  openGraph: {
    title: 'Luxanda - Le marché en ligne qui inspire confiance',
    description: 'Marketplace au Bénin. Achetez et vendez en toute confiance avec des vendeurs vérifiés et paiement Kkiapay sécurisé.',
    url: 'https://luxanda.vercel.app',
    siteName: 'Luxanda',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Luxanda - Marketplace Bénin',
      },
    ],
    locale: 'fr_BJ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxanda - Le marché en ligne qui inspire confiance',
    description: 'Marketplace au Bénin. Vendeurs vérifiés, produits locaux, paiement Kkiapay sécurisé.',
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
  other: {
    'geo.region': 'BJ',
    'geo.placename': 'Bénin, Cotonou',
    'geo.position': '6.4965;2.6293',
    'ICBM': '6.4965,2.6293',
    'language': 'fr',
    'author': 'Luxanda',
    'application-name': 'Luxanda',
    'apple-mobile-web-app-title': 'Luxanda',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-TileColor': '#FF6B35',
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
