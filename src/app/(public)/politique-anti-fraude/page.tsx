import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique Anti-Fraude - Luxanda',
  description: 'Politique de lutte contre la fraude sur Luxanda'
}

export default function PolitiqueAntiFraudePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Politique Anti-Fraude
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-gray-700 leading-relaxed">
                Luxanda s'engage à protéger ses utilisateurs contre toute forme de fraude. Cette politique 
                définit les mesures que nous prenons pour détecter, prévenir et sanctionner les activités 
                frauduleuses sur notre plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Types de fraude surveillés</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Faux produits :</strong> Vente de produits contrefaits ou non conformes</li>
                <li><strong>Escroquerie :</strong> Non-livraison après paiement</li>
                <li><strong>Manipulation de prix :</strong> Fausses promotions ou prix gonflés</li>
                <li><strong>Comptes multiples :</strong> Création de plusieurs comptes pour contourner les restrictions</li>
                <li><strong>Faux avis :</strong> Création d'avis clients fictifs</li>
                <li><strong>Usurpation d'identité :</strong> Utilisation d'informations d'autrui</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Mesures de prévention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Luxanda met en place plusieurs mesures pour prévenir la fraude :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Vérification de l'identité des vendeurs lors de l'inscription</li>
                <li>Modération manuelle des produits et boutiques</li>
                <li>Surveillance des transactions suspectes</li>
                <li>Système de signalement par les utilisateurs</li>
                <li>Analyse automatisée des comportements suspects</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Signalement de fraude</h2>
              <p className="text-gray-700 leading-relaxed">
                Si vous suspectez une activité frauduleuse, signalez-la immédiatement via :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Le bouton "Signaler" sur les pages produit et boutique</li>
                <li>Email à <a href="mailto:luxanda@yahoo.com" className="text-primary-orange hover:underline">luxanda@yahoo.com</a></li>
                <li>Appel au <a href="tel:+2290141757559" className="text-primary-orange hover:underline">+229 01 41 75 75 59</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Sanctions</h2>
              <p className="text-gray-700 leading-relaxed">
                En cas de fraude avérée, Luxanda peut :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Suspendre immédiatement le compte concerné</li>
                <li>Supprimer tous les produits frauduleux</li>
                <li>Bloquer définitivement l'accès à la plateforme</li>
                <li>Signaler l'incident aux autorités compétentes</li>
                <li>Poursuivre en justice si nécessaire</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Protection des utilisateurs</h2>
              <p className="text-gray-700 leading-relaxed">
                Luxanda recommande aux acheteurs de :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Vérifier la réputation du vendeur avant d'acheter</li>
                <li>Contacter le vendeur via WhatsApp pour confirmer les détails</li>
                <li>Ne jamais effectuer de paiement en dehors de la plateforme</li>
                <li>Conserver les preuves de transaction</li>
                <li>Signaler immédiatement tout comportement suspect</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Confidentialité</h2>
              <p className="text-gray-700 leading-relaxed">
                Tous les signalements sont traités de manière confidentielle. Les informations collectées 
                dans le cadre de la lutte anti-fraude sont utilisées uniquement à des fins de prévention 
                et de sanction.
              </p>
            </section>

            <div className="mt-12 p-6 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm text-gray-700">
                <strong>Important :</strong> Luxanda ne gère pas directement les transactions entre vendeurs 
                et acheteurs. Les paiements se font directement entre les parties via les moyens convenus 
                (Kkiapay, mobile money, etc.). Luxanda n'est pas responsable des litiges de paiement.
              </p>
            </div>

            <div className="mt-6 p-6 bg-orange-50 border-l-4 border-primary-orange rounded">
              <p className="text-sm text-gray-700">
                <strong>Dernière mise à jour :</strong> Janvier 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

