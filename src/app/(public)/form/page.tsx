import React from 'react'
import Link from 'next/link'

export default function FormPage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Contactez-nous</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 text-lg">
              Vous avez des questions ? Notre équipe est là pour vous aider.
            </p>
            <p className="text-primary-orange font-semibold mt-2">
              Réponse garantie sous 24 heures
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">📞 Contact Direct</h3>
              <p className="text-gray-700">
                Téléphone : <a href="tel:+2290193389563" className="text-primary-orange hover:text-orange-600 font-semibold">+229 01 93 38 95 63</a>
              </p>
              <p className="text-gray-700">
                Email : <a href="mailto:contact@luxanda.bj" className="text-primary-orange hover:text-orange-600 font-semibold">contact@luxanda.bj</a>
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">💬 WhatsApp</h3>
              <p className="text-gray-700 mb-3">
                Écrivez-nous directement sur WhatsApp pour une réponse immédiate.
              </p>
              <a 
                href="https://wa.me/2290193389563" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                Ouvrir WhatsApp
              </a>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">📍 Notre Bureau</h3>
              <p className="text-gray-700">
                Cotonou, Bénin<br />
                Disponible du Lundi au Samedi, 9h-18h
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="text-primary-orange hover:text-orange-600 font-semibold transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
