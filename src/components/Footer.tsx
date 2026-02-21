import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react'

const WHATSAPP_LINK = 'https://wa.me/2290141757559'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <Image
                src="/images/logo.png"
                alt="Luxanda"
                width={120}
                height={40}
                className="h-8 sm:h-10 w-auto filter brightness-0 invert"
              />
            </div>
            <p className="text-gray-300 leading-relaxed mb-4 max-w-md text-sm sm:text-base">
              La plateforme qui connecte l'Afrique au commerce en ligne, sans achat direct sur Luxanda.
              Nous facilitons les rencontres entre vendeurs et acheteurs de confiance.
            </p>

            {/* Support Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold">
                <Clock className="h-3.5 w-3.5" />
                Support disponible — Réponse sous 24h
              </div>
            </div>

            {/* WhatsApp Link */}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Écrire via WhatsApp
            </a>
          </div>


          {/* Support */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-primary-orange">Support</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base py-1 block">
                  Centre d'aide
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base py-1 block">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base py-1 block">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/vendor-subscription" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base py-1 block">
                  Devenir Vendeur
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-primary-orange">Contact</h3>
            <div className="space-y-3 sm:space-y-4">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 group">
                <MessageCircle className="h-4 sm:h-5 w-4 sm:w-5 text-green-500" />
                <span className="text-gray-300 group-hover:text-white transition-colors text-sm sm:text-base">WhatsApp</span>
              </a>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 sm:h-5 w-4 sm:w-5 text-primary-orange" />
                <span className="text-gray-300 text-sm sm:text-base">+229 01 41 75 75 59</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-primary-orange" />
                <span className="text-gray-300 text-sm sm:text-base">luxanda@yahoo.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 sm:h-5 w-4 sm:w-5 text-primary-orange" />
                <span className="text-gray-300 text-sm sm:text-base">Cotonou, Bénin</span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <h4 className="font-semibold mb-2 sm:mb-3 text-primary-orange text-sm sm:text-base">Abonnements vendeurs</h4>
              <div className="bg-primary-orange/20 text-primary-orange px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold inline-block">
                Paiement via Kkiapay
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 sm:space-y-4 md:space-y-0">
            <p className="text-gray-400 text-xs sm:text-sm">
              © 2026 Luxanda.bj - Tous droits réservés
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-4 sm:gap-x-6 gap-y-1 text-xs sm:text-sm">
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors py-1">
                À propos
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors py-1">
                CGU
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors py-1">
                Confidentialité
              </Link>
              <Link href="/legal" className="text-gray-400 hover:text-white transition-colors py-1">
                Mentions Légales
              </Link>
              <Link href="/charte-vendeur" className="text-gray-400 hover:text-white transition-colors py-1">
                Charte Vendeur
              </Link>
              <Link href="/faq" className="text-gray-400 hover:text-white transition-colors py-1">
                FAQ
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors py-1">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
