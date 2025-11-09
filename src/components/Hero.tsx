'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Shield, Truck, Award } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary-orange/10 rounded-full blur-3xl animate-bounce-subtle"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-blue/10 rounded-full blur-3xl animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-orange/5 rounded-full blur-2xl animate-bounce-subtle" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container-custom section-padding">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="text-gradient">Luxanda</span>
                <br />
                <span className="text-gray-800 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Le marché en ligne qui inspire confiance</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                La plateforme qui connecte vendeurs et acheteurs en toute confiance.
                Découvrez des produits de qualité et vendez en toute sécurité.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-4 group animate-pulse-glow hover:animate-none">
                Explorer les produits
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/register" className="btn btn-secondary text-base sm:text-lg px-6 sm:px-8 py-4 animate-scale-in">
                Devenir vendeur
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              <div className="flex items-center space-x-2 animate-float" style={{ animationDelay: '0s' }}>
                <div className="p-2 bg-green-100 rounded-lg animate-pulse">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sécurisé</p>
                  <p className="text-sm text-gray-600">Paiements protégés</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="p-2 bg-blue-100 rounded-lg animate-pulse">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Livraison</p>
                  <p className="text-sm text-gray-600">Partout au Bénin</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 animate-float" style={{ animationDelay: '1s' }}>
                <div className="p-2 bg-orange-100 rounded-lg animate-pulse">
                  <Star className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Qualité</p>
                  <p className="text-sm text-gray-600">Produits vérifiés</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="p-2 bg-purple-100 rounded-lg animate-pulse">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Récompenses</p>
                  <p className="text-sm text-gray-600">Programme fidélité</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-slide-up">
            <div className="relative z-10 flex flex-col items-center space-y-6">
              <Image
                src="/images/logoluxanda.png"
                alt="Luxanda - Logo"
                width={300}
                height={150}
                className="w-72 h-auto animate-float hover:animate-pulse-glow transition-all duration-500"
                priority
              />
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-primary-blue animate-fade-in">
                  La plateforme de confiance
                </h2>
                <p className="text-lg text-gray-600 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                  pour vos achats et ventes en ligne
                </p>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary-orange/20 rounded-full animate-bounce-subtle"></div>
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-primary-blue/20 rounded-full animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 -right-8 w-12 h-12 bg-yellow-400/30 rounded-full animate-bounce-subtle" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-green-400/30 rounded-full animate-bounce-subtle" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-10 h-10 bg-purple-400/30 rounded-full animate-bounce-subtle" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>
      </div>
    </section>
  )
}
