'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppFloat() {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Bonjour Luxanda, je souhaite contacter un vendeur')
    const whatsappUrl = `https://wa.me/2290193389564?text=${message}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleWhatsAppClick}
        className="group flex items-center space-x-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        aria-label="Contactez-nous sur WhatsApp"
      >
        <MessageCircle className="h-6 w-6 group-hover:animate-bounce" />
        <span className="font-semibold hidden sm:block">WhatsApp</span>
      </button>
    </div>
  )
}
