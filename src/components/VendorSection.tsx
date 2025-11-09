'use client'

import Link from 'next/link'
import { Store, Users, TrendingUp, Shield } from 'lucide-react'

export default function VendorSection() {
  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Espace vendeurs
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8">
                Créez votre boutique en ligne et touchez des milliers de clients.
                Les abonnements sont gérés via Kkiapay pour une sécurité maximale.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary-orange/10 rounded-lg">
                  <Store className="h-6 w-6 text-primary-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Boutique personnalisée</h3>
                  <p className="text-sm text-gray-600">Créez votre espace unique</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary-blue/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Clients ciblés</h3>
                  <p className="text-sm text-gray-600">Touchez votre audience</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Analytics avancés</h3>
                  <p className="text-sm text-gray-600">Suivez vos performances</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Paiements sécurisés</h3>
                  <p className="text-sm text-gray-600">Via Kkiapay</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/subscriptions" className="btn btn-secondary text-lg px-8 py-3">
                Voir les abonnements
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-orange rounded-full flex items-center justify-center mx-auto mb-4">
                    <Store className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Votre boutique en ligne
                  </h3>
                  <p className="text-gray-600">
                    Gérez vos produits et vos ventes facilement
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Produits publiés</span>
                    <span className="font-semibold text-primary-orange">0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Ventes ce mois</span>
                    <span className="font-semibold text-green-600">0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Statut abonnement</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Inactif
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/register" className="w-full btn btn-primary">
                    Commencer maintenant
                  </Link>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-orange/20 rounded-full animate-bounce-subtle"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary-blue/20 rounded-full animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </section>
  )
}
