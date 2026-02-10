import React from 'react'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-primary-blue">Politique de Confidentialité</h1>

      <div className="prose prose-blue max-w-none text-gray-700 space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Chez Luxanda, nous prenons la protection de vos données personnelles très au sérieux. Cette politique explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre plateforme.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">2. Collecte des données</h2>
          <p>Nous collectons les informations suivantes :</p>
          <ul className="list-disc pl-6">
            <li>Identité (Nom, prénom)</li>
            <li>Coordonnées (Email, téléphone, adresse de livraison)</li>
            <li>Données de transaction (via nos partenaires de paiement sécurisé comme Kkiapay)</li>
            <li>Données de connexion (Adresse IP, cookies)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">3. Utilisation de vos données</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul className="list-disc pl-6">
            <li>La gestion de vos commandes et livraisons</li>
            <li>La sécurisation des transactions</li>
            <li>L'amélioration de nos services et de votre expérience utilisateur</li>
            <li>Le respect de nos obligations légales</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">4. Partage des données</h2>
          <p>
            Luxanda ne vend jamais vos données à des tiers. Nous ne partageons vos informations qu'avec nos prestataires de confiance (logistique, paiement) strictement nécessaires à la réalisation de nos services.
          </p>
        </section>

        <section className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">5. Vos Droits</h2>
          <p className="text-blue-800">
            Conformément à la législation en vigueur relative à la protection des données personnelles au Bénin, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez-nous à privacy@luxanda.bj pour toute demande.
          </p>
        </section>
      </div>
    </div>
  )
}
