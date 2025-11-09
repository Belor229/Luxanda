'use client'

import { useState, useEffect } from 'react'
import { Check, Star, Crown, Zap, ArrowRight, CreditCard, Shield } from 'lucide-react'
import KkiapayWidget from '@/components/KkiapayWidget'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  duration: number
  features: string[]
  popular?: boolean
  icon: any
  color: string
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 5000,
    duration: 30,
    features: [
      'Jusqu\'à 50 produits',
      'Support email',
      'Statistiques de base',
      'Profil vendeur personnalisé'
    ],
    icon: Zap,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 15000,
    duration: 30,
    features: [
      'Produits illimités',
      'Support prioritaire',
      'Analytics avancés',
      'Mise en avant des produits',
      'Gestion des stocks',
      'Rapports de vente'
    ],
    popular: true,
    icon: Star,
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 30000,
    duration: 30,
    features: [
      'Tout de Pro',
      'Support téléphonique',
      'Formation personnalisée',
      'Programme d\'affiliation',
      'API d\'intégration',
      'Conseiller dédié'
    ],
    icon: Crown,
    color: 'from-purple-500 to-purple-600'
  }
]

export default function SubscriptionsPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'kkiapay'>('kkiapay')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showKkiapay, setShowKkiapay] = useState(false)

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handleSubscribe = async () => {
    if (!selectedPlan) return

    // Toujours utiliser Kkiapay
    setShowKkiapay(true)
  }

  const handleKkiapaySuccess = (data: any) => {
    console.log('Paiement Kkiapay réussi:', data)
    setSuccess(true)
    setShowKkiapay(false)
  }

  const handleKkiapayError = (error: any) => {
    console.error('Erreur Kkiapay:', error)
    setError('Erreur lors du paiement. Veuillez réessayer.')
    setShowKkiapay(false)
  }

  const handleKkiapayClose = () => {
    setShowKkiapay(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Abonnement créé !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre abonnement a été créé avec succès. Suivez les instructions de paiement pour l'activer.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-orange-800 mb-2">Instructions de paiement :</h3>
              <p className="text-sm text-orange-700">
                Veuillez effectuer le paiement via MTN Money au 0153932672 (Nom : DJAGBA Vioutou Odirick Belor). 
                Vous recevrez une confirmation sous 24h.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Abonnements vendeurs
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez l'abonnement qui correspond à vos besoins et commencez à vendre sur Luxanda
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-16">
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                selectedPlan === plan.id
                  ? 'border-primary-orange ring-2 ring-primary-orange ring-opacity-50'
                  : plan.popular
                  ? 'border-orange-200'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                    <span className="text-gray-600">/ {plan.duration} jours</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    selectedPlan === plan.id
                      ? 'bg-primary-orange text-white'
                      : plan.popular
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Sélectionné' : 'Sélectionner'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Method Selection */}
        {selectedPlan && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Méthode de paiement
              </h2>

              <div className="mb-8">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <div className="font-semibold text-gray-900">Kkiapay</div>
                      <div className="text-sm text-gray-600">Paiement sécurisé en ligne</div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="flex-1 btn btn-outline"
                >
                  Annuler
                </button>
                <KkiapayWidget
                  amount={subscriptionPlans.find(p => p.id === selectedPlan)?.price || 0}
                  key="03203870a86211f0a1b38145be59aef5"
                  callback="https://luxanda.bj/subscription/callback"
                  onSuccess={handleKkiapaySuccess}
                  onError={handleKkiapayError}
                  onClose={handleKkiapayClose}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
