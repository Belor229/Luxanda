import React from 'react'

export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="max-w-2xl mx-auto bg-orange-50 p-12 rounded-[40px] border border-primary-orange/20 shadow-xl shadow-primary-orange/5">
        <h1 className="text-5xl font-black text-gray-900 mb-6">Livraison</h1>
        <p className="text-xl text-gray-600 mb-8 font-medium">
          Le service de livraison Luxanda est actuellement <span className="text-primary-orange font-bold">en cours de lancement</span>.
        </p>
        <p className="text-gray-500 leading-relaxed italic">
          Pour le moment, les modalités de livraison sont à convenir directement avec le vendeur lors de votre échange.
          Luxanda s'engage à simplifier ce processus très prochainement.
        </p>
      </div>
    </div>
  )
}

