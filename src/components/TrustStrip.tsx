import { ShieldCheck, Zap, CreditCard, MessageCircle } from 'lucide-react'

export default function TrustStrip() {
  const items = [
    { icon: <ShieldCheck className="h-5 w-5" />, text: "Mise en relation de confiance" },
    { icon: <Zap className="h-5 w-5" />, text: "Paiement direct au vendeur" },
    { icon: <CreditCard className="h-5 w-5" />, text: "Paiement à la livraison" },
    { icon: <MessageCircle className="h-5 w-5" />, text: "Support WhatsApp & Téléphone" },

  ]

  return (
    <section className="bg-primary-blue text-white py-6 border-y border-white/10 shadow-lg">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-10">
            {items.map((item, i) => (
              <div key={i} className="flex items-center space-x-3 group">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-primary-orange transition-colors">
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          <div className="text-right hidden lg:block border-l border-white/20 pl-8">
            <p className="text-xs text-gray-300 font-light italic">
              Luxanda facilite vos échanges en toute sécurité.<br />
              Transactions directes avec les vendeurs.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
