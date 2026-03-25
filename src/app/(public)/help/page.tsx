import React from 'react'
import Link from 'next/link'

export default function HelpPage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Centre d'Aide</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🛍️ Pour les Acheteurs</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Comment acheter sur Luxanda ?</h3>
                <p className="text-gray-600 text-sm">Parcourez le catalogue, contactez les vendeurs via WhatsApp et convenez d'un rendez-vous pour l'achat et le paiement.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">La livraison est-elle disponible ?</h3>
                <p className="text-gray-600 text-sm">La livraison est en cours de lancement. Actuellement, les achats se font en main propre avec les vendeurs.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Comment savoir si un vendeur est fiable ?</h3>
                <p className="text-gray-600 text-sm">Tous nos vendeurs professionnels sont vérifiés (badge ✓) et ont soumis leurs pièces d'identité.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🏪 Pour les Vendeurs</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Comment devenir vendeur ?</h3>
                <p className="text-gray-600 text-sm">Inscrivez-vous, complétez votre dossier KYC et attendez la validation (24-48h).</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Quels sont les tarifs ?</h3>
                <p className="text-gray-600 text-sm">Abonnement STARTER: 5k/mois, PRO: 15k/3mois, PREMIUM: 30k/an. 14 jours d'essai gratuit.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Comment gérer mes produits ?</h3>
                <p className="text-gray-600 text-sm">Accédez à votre tableau de bord vendeur pour ajouter, modifier et supprimer vos articles.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Questions Fréquentes</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">💰 Quels sont les moyens de paiement acceptés ?</h3>
              <p className="text-gray-700">Nous acceptons les paiements via Kkiapay (Mobile Money, carte bancaire) pour les abonnements vendeurs. Pour les achats, le paiement se fait directement avec le vendeur.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">🔒 Mes informations sont-elles sécurisées ?</h3>
              <p className="text-gray-700">Oui, nous utilisons des protocoles de sécurité avancés et ne partageons jamais vos données sans votre consentement.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">⏱️ Quel est le délai de validation vendeur ?</h3>
              <p className="text-gray-700">Le processus de validation prend généralement 24-48 heures après soumission de vos documents.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">📱 Puis-je utiliser Luxanda sur mobile ?</h3>
              <p className="text-gray-700">Oui, Luxanda est entièrement responsive et fonctionne parfaitement sur tous les appareils mobiles.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-primary-blue text-white rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4">Besoin d'aide supplémentaire ?</h3>
            <p className="mb-6">Notre support client est disponible pour répondre à toutes vos questions.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+2290193389563"
                className="bg-white text-primary-blue px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                📞 Appeler
              </a>
              <a 
                href="https://wa.me/2290193389563"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                💬 WhatsApp
              </a>
              <Link 
                href="/contact"
                className="bg-primary-orange text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                ✉️ Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
