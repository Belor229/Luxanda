'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm gap-2 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-6">
              <span className="flex items-center space-x-2">
                <span>📞</span>
                <span>+229 01 93 38 95 63</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>📧</span>
                <span>luxanda@yahoo.com</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
              <Link href="/register" className="hover:text-primary-orange transition-colors py-1 px-2 rounded">
                Devenir Vendeur
              </Link>
              <Link href="/login" className="hover:text-primary-orange transition-colors py-1 px-2 rounded">
                Se connecter
              </Link>
              <Link
                href="https://wa.me/2290141757559?text=Bonjour%20Luxanda%2C%20j%E2%80%99ai%20une%20question"
                target="_blank"
                rel="noopener"
                className="hover:text-primary-orange transition-colors py-1 px-2 rounded"
              >
                WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/logoluxanda.png"
              alt="Luxanda"
              width={150}
              height={50}
              className="h-10 sm:h-12 w-auto"
              priority
            />
          </Link>

          {/* Header Icons */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 text-gray-600 hover:text-primary-orange transition-colors rounded-lg hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-primary-blue">
        <div className="container-custom">
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center space-y-4 md:space-y-0 md:space-x-8 py-4">
              <Link href="/" className="text-white hover:text-primary-orange transition-colors font-medium py-2 px-3 rounded-lg hover:bg-white/10 min-h-[44px] flex items-center">
                Accueil
              </Link>
              <Link href="/products" className="text-white hover:text-primary-orange transition-colors font-medium py-2 px-3 rounded-lg hover:bg-white/10 min-h-[44px] flex items-center">
                Produits
              </Link>
              <Link href="/contact" className="text-white hover:text-primary-orange transition-colors font-medium py-2 px-3 rounded-lg hover:bg-white/10 min-h-[44px] flex items-center">
                Contact
              </Link>
              <Link href="/affiliation" className="text-white hover:text-primary-orange transition-colors font-medium py-2 px-3 rounded-lg hover:bg-white/10 min-h-[44px] flex items-center">
                Affiliation
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
