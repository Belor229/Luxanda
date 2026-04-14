import Link from 'next/link'
import { Check } from 'lucide-react'

const plans = [
    {
        name: 'Starter',
        price: 5000,
        features: ['Jusqu\'à 50 produits', 'Support email', 'Statistiques de base', 'Badge vendeur vérifié'],
        recommended: false,
    },
    {
        name: 'Pro',
        price: 15000,
        features: ['Produits illimités', 'Niveau de priorité élevé', 'Analytics avancés', 'Mise en avant mensuelle', 'Support 7j/7'],
        recommended: true,
    },
    {
        name: 'Premium',
        price: 30000,
        features: ['Tout de Business Pro', 'Support téléphonique dédié', 'Formation personnalisée', 'Badge Premium exclusif', 'Mise en avant prioritaire dans les résultats'],
        recommended: false,
    }
]

export default function SubscriptionPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Choisissez votre plan
                </h1>
                <p className="mt-4 text-xl text-gray-500">
                    Des options flexibles pour faire grandir votre business sur Luxanda
                </p>
                
                {/* Offre Spéciale Lancement */}
                <div className="mt-6 bg-gradient-to-r from-primary-orange to-orange-600 p-6 rounded-2xl text-white max-w-2xl mx-auto">
                    <div className="flex items-center justify-center mb-3">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">OFFRE SPÉCIALE</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">14 JOURS GRATUITS</h3>
                    <p className="text-white/90">
                        Pour tout nouveau vendeur, profitez de 14 jours d'abonnement Premium gratuit 
                        pour tester la plateforme sans engagement.
                    </p>
                    <div className="mt-4 text-sm text-white/80">
                        ✅ Accès illimité aux fonctionnalités<br/>
                        ✅ Support prioritaire<br/>
                        ✅ Mise en avant de vos produits<br/>
                        ✅ Sans engagement, résiliation possible
                    </div>
                </div>
            </div>

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
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

                        <div className="p-4 sm:p-6 sm:p-8 flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{plan.name}</h3>
                            <p className="mt-4 flex items-baseline text-gray-900">
                                <span className="text-2xl sm:text-4xl font-extrabold tracking-tight">{plan.price.toLocaleString()}</span>
                                <span className="ml-1 text-sm sm:text-xl font-semibold text-gray-500">FCFA</span>
                                <span className="ml-1 text-xs sm:text-sm text-gray-500">/mois</span>
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

                        <div className="p-4 sm:p-6 sm:p-8 bg-gray-50 rounded-b-2xl">
                                <a
                                    href={`https://wa.me/2290193389564?text=Bonjour, je souhaite souscrire au plan vendeur ${plan.name} sur Luxanda.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-full block text-center btn ${plan.recommended ? 'btn-primary' : 'btn-primary bg-gray-800 hover:bg-gray-900'} py-2 sm:py-3 text-sm sm:text-lg font-semibold`}
                                >
                                    Choisir {plan.name}
                                </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

