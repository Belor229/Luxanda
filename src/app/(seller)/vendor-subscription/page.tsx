'use client'

import React, { useState } from 'react'
import { Check, ShieldCheck, Zap, Rocket, Crown, ArrowRight, Gift, MessageCircle } from 'lucide-react'
import Link from 'next/link'

const WHATSAPP_LINK = 'https://wa.me/2290141757559'

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 5000,
    icon: Rocket,
    color: 'blue',
    features: ['Jusqu\'à 50 produits', 'Support email', 'Statistiques de base', 'Badge vendeur vérifié'],
    description: 'Parfait pour débuter votre activité sur Luxanda.',
    link: 'https://direct.kkiapay.me/37365/luxanda-plan-starter-Lga521FgK'
  },
  {
    id: 'PRO',
    name: 'Business Pro',
    price: 15000,
    icon: Zap,
    color: 'orange',
    featured: true,
    features: ['Produits illimités', 'Niveau de priorité élevé', 'Analytics avancés', 'Mise en avant mensuelle', 'Support 7j/7'],
    description: 'La solution optimale pour les boutiques en croissance.',
    link: 'https://direct.kkiapay.me/37365/luxanda-plan-pro-ga-wXBWyv'
  },
  {
    id: 'PREMIUM',
    name: 'Luxe Premium',
    price: 30000,
    icon: Crown,
    color: 'purple',
    features: ['Tout de Business Pro', 'Support téléphonique dédié', 'Formation personnalisée', 'Badge Premium exclusif', 'Mise en avant prioritaire dans les résultats'],
    description: 'L\'expérience ultime pour dominer le marché.',
    link: 'https://direct.kkiapay.me/37365/luxanda-plan-premium-aUJiQWZGd'
  }
]

export default function VendorSubscriptionPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto">
        {/* Trial Banner */}
        <div className="mb-8 sm:mb-10 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border border-green-200/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-green-100 rounded-xl sm:rounded-2xl flex-shrink-0">
              <Gift className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-green-700 leading-snug">Tous les nouveaux vendeurs bénéficient automatiquement de <strong>14 jours d'essai Premium</strong> — sans carte bancaire, sans engagement.</p>
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 tracking-tight mb-4">
            Propulsez votre boutique au <span className="text-primary-orange">niveau supérieur</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-gray-500 font-medium">
            Choisissez le plan qui correspond à vos ambitions et commencez à vendre dès aujourd'hui.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl sm:rounded-[40px] shadow-sm border ${plan.featured ? 'border-primary-orange ring-4 ring-primary-orange/5' : 'border-gray-100'} p-6 sm:p-8 flex flex-col hover:shadow-xl transition-all duration-500 group`}
            >
              {plan.featured && (
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 bg-primary-orange text-white px-4 sm:px-6 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-black tracking-widest uppercase shadow-lg shadow-primary-orange/20">
                  Recommandé
                </div>
              )}

              <div className="mb-6 sm:mb-8">
                <div className={`p-3 sm:p-4 w-fit rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform ${plan.color === 'blue' ? 'bg-blue-50' : plan.color === 'orange' ? 'bg-orange-50' : 'bg-purple-50'
                  }`}>
                  <plan.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${plan.color === 'blue' ? 'text-blue-600' : plan.color === 'orange' ? 'text-orange-600' : 'text-purple-600'
                    }`} />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-xs sm:text-sm font-medium leading-relaxed">{plan.description}</p>
              </div>

              <div className="mb-6 sm:mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-5xl font-black text-gray-900">{plan.price.toLocaleString()}</span>
                  <span className="text-base sm:text-xl font-bold text-gray-400 capitalize">FCFA / mois</span>
                </div>
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 bg-green-50 p-0.5 rounded-full flex-shrink-0">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-600 font-medium text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.link}
                className={`w-full py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl text-base sm:text-lg font-black transition-all flex items-center justify-center gap-2 min-h-[52px] ${plan.featured
                  ? 'bg-primary-orange text-white hover:bg-orange-600 shadow-xl shadow-orange-500/20'
                  : 'bg-gray-900 text-white hover:bg-black shadow-xl shadow-black/10'
                  }`}
              >
                <>
                  Commencer maintenant
                  <ArrowRight className="h-5 w-5" />
                </>
              </a>
            </div>
          ))}
        </div>

        {/* FAQ mini */}
        <div className="mt-12 sm:mt-16 max-w-3xl mx-auto text-center">
          <p className="text-gray-500 mb-3 text-sm sm:text-base">Des questions sur nos abonnements ?</p>
          <Link href="/faq" className="text-primary-orange font-bold hover:underline text-sm sm:text-base">
            Consultez notre FAQ vendeurs →
          </Link>
        </div>

        {/* WhatsApp CTA */}
        <div className="mt-12 sm:mt-20 text-center bg-gray-900 rounded-3xl sm:rounded-[50px] p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4">Besoin d'un accompagnement sur mesure ?</h2>
            <p className="text-gray-400 font-medium mb-6 sm:mb-8 max-w-xl mx-auto text-sm sm:text-base">
              Notre équipe d'experts est là pour vous aider à configurer votre boutique et optimiser vos ventes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black transition-colors min-h-[52px]"
              >
                <MessageCircle className="h-5 w-5" />
                Discuter sur WhatsApp
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-900 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black transition-colors min-h-[52px]"
              >
                Nous écrire
              </Link>
            </div>
            <p className="mt-4 text-gray-500 text-xs sm:text-sm">💬 Support disponible — Réponse sous 24h</p>
          </div>
        </div>
      </div>
    </div>
  )
}
