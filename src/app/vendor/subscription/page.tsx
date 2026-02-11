'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import KkiapayButton from '@/components/KkiapayButton'

const plans = [
    {
        name: 'Starter',
        price: 5000,
        features: ['Jusqu\'à 10 produits', 'Commission standard', 'Support email'],
        recommended: false
    },
    {
        name: 'Pro',
        price: 15000,
        features: ['Jusqu\'à 50 produits', 'Commission réduite', 'Support prioritaire', 'Badge vendeur vérifié'],
        recommended: true
    },
    {
        name: 'Premium',
        price: 30000,
        features: ['Produits illimités', 'Commission minimale', 'Support dédié 24/7', 'Mise en avant produits'],
        recommended: false
    }
]

export default function SubscriptionPage() {
    const router = useRouter()
    const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)

    const handlePaymentSuccess = async (response: any) => {
        console.log('Payment successful:', response)

        try {
            const res = await fetch('/api/subscriptions/active', { // Endpoint to activate
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planPrefix: selectedPlan?.name.toUpperCase(), // STARTER, PRO, PREMIUM
                    transactionId: response.transactionId
                })
            })

            if (res.ok) {
                alert('Abonnement activé avec succès !')
                router.push('/vendor/dashboard')
            } else {
                alert('Erreur lors de l\'activation de l\'abonnement. Contactez le support.')
            }
        } catch (error) {
            console.error('Activation error:', error)
            alert('Erreur lors de l\'activation')
        }
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Choisissez votre plan
                </h1>
                <p className="mt-4 text-xl text-gray-500">
                    Des options flexibles pour faire grandir votre business sur Luxanda
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`relative bg-white rounded-2xl shadow-lg flex flex-col ${plan.recommended ? 'ring-2 ring-primary-orange scale-105 z-10' : ''
                            }`}
                    >
                        {plan.recommended && (
                            <div className="absolute top-0 transform -translate-y-1/2 left-1/2 -translate-x-1/2">
                                <span className="inline-block bg-primary-orange text-white text-xs font-semibold tracking-wider uppercase rounded-full py-1 px-4">
                                    Recommandé
                                </span>
                            </div>
                        )}

                        <div className="p-8 flex-1">
                            <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                            <p className="mt-4 flex items-baseline text-gray-900">
                                <span className="text-4xl font-extrabold tracking-tight">{plan.price.toLocaleString()}</span>
                                <span className="ml-1 text-xl font-semibold text-gray-500">FCFA</span>
                                <span className="ml-1 text-sm text-gray-500">/mois</span>
                            </p>

                            <ul role="list" className="mt-6 space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex">
                                        <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                                        <span className="ml-3 text-sm text-gray-500">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-8 bg-gray-50 rounded-b-2xl">
                            {selectedPlan?.name === plan.name ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-center text-gray-600 mb-2">Paiement via Kkiapay</p>
                                    <KkiapayButton
                                        amount={plan.price}
                                        callback={handlePaymentSuccess}
                                        data={{ plan: plan.name }}
                                    />
                                    <button
                                        onClick={() => setSelectedPlan(null)}
                                        className="w-full btn btn-outline text-sm mt-2"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`w-full btn ${plan.recommended ? 'btn-primary' : 'btn-primary bg-gray-800 hover:bg-gray-900'} py-3 text-lg font-semibold`}
                                >
                                    Choisir {plan.name}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
