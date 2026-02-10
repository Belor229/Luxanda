import React from 'react'

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-primary-blue">Conditions Générales d'Utilisation (CGU)</h1>

      <div className="prose prose-orange max-w-none text-gray-700 space-y-8">
        <p className="italic text-gray-500 text-sm">Dernière mise à jour : 10 Février 2026</p>

        <section>
          <h2 className="text-xl font-semibold mb-4">1. Acceptation des conditions</h2>
          <p>
            L'accès et l'utilisation de la plateforme Luxanda impliquent l'acceptation sans réserve des présentes CGU. Si vous n'acceptez pas ces conditions, vous devez cesser d'utiliser nos services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">2. Services de la plateforme</h2>
          <p>
            Luxanda est une marketplace mettant en relation des vendeurs et des acheteurs. Luxanda agit en tant qu'intermédiaire et n'est pas partie au contrat de vente entre le vendeur et l'acheteur, sauf mention contraire.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">3. Obligations des utilisateurs</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Vendeurs :</strong> Vous vous engagez à ne vendre que des produits légaux, conformes à la description et dont vous détenez les droits.</li>
            <li><strong>Acheteurs :</strong> Vous vous engagez à fournir des informations exactes et à honorer vos engagements d'achat.</li>
          </ul>
        </section>

        <section className="bg-orange-50 p-6 rounded-lg border-l-4 border-primary-orange">
          <h2 className="text-xl font-semibold mb-2 text-orange-900">4. Système d'Abonnement</h2>
          <p className="text-orange-800 text-sm">
            Les vendeurs doivent souscrire à un abonnement actif pour publier des produits sur la plateforme. L'abonnement est facturé mensuellement et n'est pas remboursable, sauf cas exceptionnel prévu par la loi.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">5. Responsabilité</h2>
          <p>
            Luxanda décline toute responsabilité en cas de litige entre vendeurs et acheteurs, bien que nous puissions intervenir en tant que médiateur pour assurer la satisfaction de nos utilisateurs.
          </p>
        </section>
      </div>
    </div>
  )
}
