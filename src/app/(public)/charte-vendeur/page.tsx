import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Charte Vendeur - Luxanda',
  description: 'Charte de modération et règles pour les vendeurs sur Luxanda'
}

export default function CharteVendeurPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Charte Vendeur Luxanda
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Engagement de qualité</h2>
              <p className="text-gray-700 leading-relaxed">
                En tant que vendeur sur Luxanda, vous vous engagez à proposer des produits de qualité,
                conformes aux descriptions fournies et aux images présentées. Toute fausse représentation
                est strictement interdite.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Responsabilités du vendeur</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Maintenir des stocks à jour et précis</li>
                <li>Répondre rapidement aux demandes des clients via WhatsApp</li>
                <li>Respecter les délais de livraison annoncés</li>
                <li>Gérer les retours et réclamations de manière professionnelle</li>
                <li>Respecter les lois et réglementations en vigueur au Bénin</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Interdictions</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Il est strictement interdit de :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Vendre des produits contrefaits, illégaux ou dangereux</li>
                <li>Utiliser des images volées ou protégées par le droit d'auteur</li>
                <li>Manipuler les prix ou créer de fausses promotions</li>
                <li>Harceler ou insulter des clients</li>
                <li>Contourner le système de paiement de Luxanda</li>
                <li>Créer plusieurs comptes pour contourner les restrictions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Modération et sanctions</h2>
              <p className="text-gray-700 leading-relaxed">
                Luxanda se réserve le droit de modérer tous les contenus et peut, en cas de non-respect
                de cette charte, suspendre ou supprimer votre compte vendeur sans préavis. Les sanctions
                peuvent inclure :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Avertissement écrit</li>
                <li>Suspension temporaire du compte</li>
                <li>Suppression définitive du compte</li>
                <li>Signalement aux autorités compétentes en cas d'infraction grave</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Abonnements</h2>
              <p className="text-gray-700 leading-relaxed">
                Les vendeurs doivent maintenir un abonnement actif pour continuer à vendre sur la plateforme.
                En cas d'expiration de l'abonnement, les produits seront masqués jusqu'au renouvellement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                Pour toute question concernant cette charte, contactez-nous à{' '}
                <a href="mailto:luxanda@yahoo.com" className="text-primary-orange hover:underline">
                  luxanda@yahoo.com
                </a>
                {' '}ou au{' '}
                <a href="tel:+2290141757559" className="text-primary-orange hover:underline">
                  +229 01 41 75 75 59
                </a>.
              </p>
            </section>

            <div className="mt-12 p-6 bg-orange-50 border-l-4 border-primary-orange rounded">
              <p className="text-sm text-gray-700">
                <strong>Dernière mise à jour :</strong> 25 février 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

