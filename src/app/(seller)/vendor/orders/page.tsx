'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, ArrowRight } from 'lucide-react'

export default function VendorOrdersPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 max-w-2xl w-full text-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl"></div>
        <div className="relative z-10 font-sans">
          <div className="bg-blue-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <MessageCircle className="h-12 w-12 text-primary-blue" />
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
            Gestion via WhatsApp
          </h2>
          
          <p className="text-gray-500 font-medium text-lg leading-relaxed mb-8 max-w-md mx-auto">
            Sur Luxanda, la gestion des commandes se fait directement via WhatsApp 
            pour une communication plus rapide et personnalisée avec vos clients.
          </p>

          <div className="bg-gray-50 p-6 rounded-2xl mb-8">
            <h3 className="font-bold text-gray-900 mb-4">🔄 Processus simplifié</h3>
            <div className="space-y-3 text-left text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <span className="bg-primary-orange text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Client découvre vos produits sur Luxanda</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-primary-orange text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Client vous contacte via WhatsApp intégré</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-primary-orange text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Vous gérez directement : devis, paiement, livraison</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/vendor/dashboard"
              className="w-full inline-flex items-center justify-center gap-3 bg-primary-blue text-white px-8 py-4 rounded-2xl font-black text-lg transition-all hover:bg-blue-700 shadow-xl"
            >
              Retour au tableau de bord
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <a
              href="https://wa.me/2290141757559"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl"
            >
              <MessageCircle className="h-5 w-5" />
              Support WhatsApp
            </a>
          </div>

          <div className="mt-8 text-sm text-gray-400">
            <p>💡 Avantages : Communication instantanée, gestion flexible, relation client directe</p>
          </div>
        </div>
      </div>
    </div>
  )
}
