import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'

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
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
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
      <body className={`${inter.className} antialiased`}>
        <Header />
        {children}
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  )
}
