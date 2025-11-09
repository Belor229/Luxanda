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
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <span className="flex items-center space-x-2">
                <span>📞</span>
                <span>+229 01 93 38 95 63</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>📧</span>
                <span>luxanda@yahoo.com</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/register" className="hover:text-primary-orange transition-colors">
                Devenir Vendeur
              </Link>
              <Link href="/login" className="hover:text-primary-orange transition-colors">
                Se connecter
              </Link>
              <Link 
                href="https://wa.me/2290141757559?text=Bonjour%20Luxanda%2C%20j%E2%80%99ai%20une%20question" 
                target="_blank" 
                rel="noopener"
                className="hover:text-primary-orange transition-colors"
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
              src="/images/logo.png"
              alt="Luxanda"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>


          {/* Header Icons */}
          <div className="flex items-center space-x-4">
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-orange transition-colors"
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
            <div className="flex flex-wrap items-center space-x-8 py-4">
              <Link href="/" className="text-white hover:text-primary-orange transition-colors font-medium">
                Accueil
              </Link>
              <Link href="/products" className="text-white hover:text-primary-orange transition-colors font-medium">
                Produits
              </Link>
              <Link href="/contact" className="text-white hover:text-primary-orange transition-colors font-medium">
                Contact
              </Link>
              <Link href="/affiliation" className="text-white hover:text-primary-orange transition-colors font-medium">
                Affiliation
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
