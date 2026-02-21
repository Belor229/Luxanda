import React from 'react'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-primary-blue text-center">À Propos de Luxanda</h1>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Notre Mission</h2>
          <p>
            Luxanda est né d'une vision simple : créer un écosystème commercial numérique au Bénin et en Afrique qui soit fondé sur la <strong>confiance</strong>, la <strong>transparence</strong> et l'<strong>excellence</strong>. Nous connectons les vendeurs talentueux avec des acheteurs exigeants pour offrir une expérience shopping sécurisée et inspirante.
          </p>
        </section>

        <section className="bg-orange-50 p-8 rounded-2xl border border-orange-100">
          <h2 className="text-2xl font-semibold text-primary-orange mb-4">Pourquoi Luxanda ?</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Sûreté :</strong> Chaque transaction est sécurisée par des protocoles de pointe.</li>
            <li><strong>Qualité :</strong> Nous encourageons nos vendeurs à maintenir les plus hauts standards.</li>
            <li><strong>Proximité :</strong> Une plateforme pensée pour les réalités et les besoins du marché local.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Notre Histoire</h2>
          <p>
            Lancée en 2026, Luxanda a commencé comme une réponse à la fragmentation du e-commerce local. Nous avons compris que le principal frein aux achats en ligne n'était pas la technologie, mais la confiance. C'est pourquoi nous avons mis l'accent sur la vérification des vendeurs et un service client irréprochable.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rejoignez l'Aventure</h2>
          <p>
            Que vous soyez un artisan local, une marque établie ou un acheteur à la recherche de la perle rare, Luxanda est votre destination. Ensemble, construisons le futur du commerce en Afrique.
          </p>
        </section>
      </div>
    </div>
  )
}
