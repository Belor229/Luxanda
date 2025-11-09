export default function TrustStrip() {
  return (
    <section className="bg-gray-900 text-white py-4">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="bg-primary-orange/20 text-primary-orange px-3 py-1 rounded-full text-sm font-semibold">
              Mise en relation
            </span>
            <span className="bg-primary-orange/20 text-primary-orange px-3 py-1 rounded-full text-sm font-semibold">
              Paiement direct au vendeur
            </span>
            <span className="bg-primary-orange/20 text-primary-orange px-3 py-1 rounded-full text-sm font-semibold">
              Abonnements vendeurs via Kkiapay
            </span>
            <span className="bg-primary-orange/20 text-primary-orange px-3 py-1 rounded-full text-sm font-semibold">
              Support: WhatsApp & Téléphone
            </span>
          </div>
          <div className="text-sm text-gray-300 text-center lg:text-right">
            <p>Luxanda ne gère pas le paiement des commandes. Les transactions se font avec les vendeurs.</p>
            <p>Les options de livraison seront annoncées prochainement.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
