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

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
            <div className="text-3xl font-black text-primary-blue mb-1">10+</div>
            <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Catégories</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
            <div className="text-3xl font-black text-primary-blue mb-1">12+</div>
            <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Villes</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
            <div className="text-3xl font-black text-primary-blue mb-1">50+</div>
            <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Pionniers</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
            <div className="text-3xl font-black text-primary-blue mb-1">24h</div>
            <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Support</div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Une Vision Pan-Africaine depuis Cotonou</h2>
          <p>
            Luxanda n'est pas qu'une simple plateforme numérique ; c'est un moteur de croissance locale. En partant du <strong>Bénin</strong>, notre ambition est de redéfinir le commerce de proximité dans toute l'Afrique. Nous croyons que le futur du e-commerce africain ne ressemble pas à Amazon, mais à une marketplace hybride où le numérique renforce les relations humaines.
          </p>
        </section>

        <section className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
          <h2 className="text-2xl font-semibold text-primary-blue mb-4">Ce qui nous différencie</h2>
          <p className="mb-4">
            Contrairement à <strong>Facebook Marketplace</strong> ou aux <strong>groupes WhatsApp</strong> souvent informels et risqués, Luxanda impose une vérification rigoureuse (KYC) de chaque vendeur professionnel.
          </p>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Identité vérifiée :</strong> Fini l'anonymat, nous savons qui vend sur notre plateforme.</li>
            <li><strong>Zéro commission sur les ventes :</strong> Les vendeurs gardent 100% de leur profit, ils ne paient qu'un abonnement fixe.</li>
            <li><strong>Support Local :</strong> Une équipe basée à Cotonou pour vous assister en temps réel.</li>
          </ul>
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
