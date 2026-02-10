import React from 'react'

export default function FAQPage() {
  const faqs = [
    {
      q: "Comment puis-je devenir vendeur sur Luxanda ?",
      a: "Il suffit de créer un compte avec le rôle 'Vendeur', de choisir un pack d'abonnement et de compléter votre profil. Une fois approuvé, vous pourrez lister vos produits."
    },
    {
      q: "Quels sont les modes de paiement acceptés ?",
      a: "Nous acceptons les paiements sécurisés via Kkiapay (Mobile Money, Cartes bancaires)."
    },
    {
      q: "Comment se déroule la livraison ?",
      a: "La livraison est gérée soit par le vendeur, soit par les partenaires logistiques de Luxanda. Vous recevrez une notification au départ de votre colis."
    },
    {
      q: "Puis-je annuler une commande ?",
      a: "Oui, tant que la commande n'a pas encore été expédiée. Contactez le service client pour une assistance rapide."
    }
  ]

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-primary-blue text-center">Foire Aux Questions (FAQ)</h1>

      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-primary-orange transition-colors">
            <h3 className="font-bold text-lg text-gray-900 mb-2">{faq.q}</h3>
            <p className="text-gray-600">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center p-8 bg-gray-50 rounded-2xl">
        <p className="text-gray-600 mb-4">Vous n'avez pas trouvé votre réponse ?</p>
        <a href="/contact" className="btn btn-primary">Contactez-nous directement</a>
      </div>
    </div>
  )
}
