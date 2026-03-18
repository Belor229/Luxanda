'use client'

import { useState } from 'react'
import { ChevronDown, Store, ShoppingBag, HelpCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'

const WHATSAPP_LINK = 'https://wa.me/2290141757559'

const vendorFaqs = [
  {
    q: "Comment fonctionne l'abonnement vendeur ?",
    a: "Luxanda propose 3 formules d'abonnement (Starter, Business Pro, Luxe Premium) pour les vendeurs. Chaque plan vous donne accès à des fonctionnalités adaptées à la taille de votre activité. L'abonnement est mensuel et payable via Kkiapay (Mobile Money ou carte bancaire)."
  },
  {
    q: "Qu'inclut l'offre de 14 jours gratuits ?",
    a: "Chaque nouveau vendeur bénéficie automatiquement de 14 jours d'essai gratuit avec toutes les fonctionnalités Premium (produits illimités, analytics avancés, support prioritaire). Aucune carte bancaire n'est requise. Vous ne serez facturé qu'à la fin de la période d'essai si vous souhaitez continuer."
  },
  {
    q: "Luxanda gère-t-elle la livraison de mes produits ?",
    a: "Non. Luxanda est une plateforme de mise en relation. La livraison est entièrement sous la responsabilité du vendeur. Vous organisez la remise directement avec vos clients, par livraison personnelle, via un coursier ou en point de retrait. Le service logistique Luxanda est en cours de lancement."
  },
  {
    q: "Comment mes clients me contactent-ils ?",
    a: "Les acheteurs intéressés par vos produits peuvent vous contacter directement via le numéro WhatsApp que vous renseignez lors de votre inscription. Luxanda facilite la mise en relation, le reste se fait entre vous et votre client."
  },
  {
    q: "Dans quels cas mon compte vendeur peut-il être suspendu ?",
    a: "Votre compte peut être suspendu si vous ne respectez pas la Charte Vendeur : produits contrefaits, descriptions trompeuses, non-respect des clients, ou activité frauduleuse. Luxanda se réserve le droit de suspendre tout compte en cas de signalement vérifié. Consultez notre Charte Vendeur pour plus de détails."
  },
  {
    q: "Puis-je annuler mon abonnement à tout moment ?",
    a: "Oui, vous pouvez ne pas renouveler votre abonnement à la fin du mois en cours. Vos produits resteront visibles jusqu'à la fin de la période payée, puis seront automatiquement masqués."
  }
]

const buyerFaqs = [
  {
    q: "Luxanda gère-t-elle le paiement des produits ?",
    a: "Non. Luxanda ne traite pas les paiements entre acheteurs et vendeurs. Le paiement se fait directement entre vous et le vendeur, généralement à la livraison (Cash on Delivery) ou selon les modalités convenues ensemble. Seuls les abonnements vendeurs sont payés via la plateforme."
  },
  {
    q: "Comment puis-je contacter un vendeur ?",
    a: "Chaque fiche produit affiche les coordonnées du vendeur (WhatsApp). Cliquez sur le bouton de contact pour discuter directement avec lui, poser vos questions et convenir des modalités de livraison et de paiement."
  },
  {
    q: "Que faire si j'ai un problème avec un vendeur ?",
    a: "Si vous rencontrez un problème (produit non conforme, vendeur non joignable, arnaque suspectée), vous pouvez signaler le vendeur directement via notre page Contact ou notre WhatsApp support. Nous enquêterons et prendrons les mesures nécessaires, pouvant aller jusqu'à la suspension du compte vendeur."
  },
  {
    q: "Quelle est la responsabilité de Luxanda en cas de litige ?",
    a: "Luxanda agit en tant que plateforme de mise en relation et ne peut être tenue responsable des transactions entre acheteurs et vendeurs. Cependant, nous prenons très au sérieux tout signalement et agissons pour maintenir un environnement de confiance : vérification des vendeurs, modération des produits, et suspension des comptes frauduleux."
  },
  {
    q: "Les produits sont-ils vérifiés par Luxanda ?",
    a: "Chaque produit publié est soumis à une modération avant d'apparaître sur la plateforme. Nous vérifions la conformité des descriptions et supprimons les annonces suspectes. Cependant, Luxanda ne peut garantir la qualité physique de chaque produit — c'est pourquoi nous encourageons le paiement à la livraison."
  }
]

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white hover:border-primary-orange/30 transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 min-h-[56px]"
        aria-expanded={open}
      >
        <span className="font-bold text-sm sm:text-base text-gray-900 leading-snug">{q}</span>
        <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-primary-orange' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-gray-600 leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-blue via-primary-blue/90 to-primary-orange/80 py-14 sm:py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            <HelpCircle className="h-4 w-4" />
            Centre d'aide
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">Foire Aux Questions</h1>
          <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur Luxanda, que vous soyez vendeur ou acheteur.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 sm:py-16 max-w-4xl">
        {/* Section Vendeurs */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="p-2.5 bg-orange-50 rounded-xl">
              <Store className="h-6 w-6 text-primary-orange" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">FAQ Vendeurs</h2>
              <p className="text-sm text-gray-500">Abonnement, essai gratuit, responsabilités</p>
            </div>
          </div>

          {/* Trial Badge */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-black text-green-800 text-sm sm:text-base">14 jours gratuits pour essayer !</p>
              <p className="text-xs sm:text-sm text-green-700">Tous les nouveaux vendeurs bénéficient de 14 jours d'essai Premium — sans engagement.</p>
            </div>
          </div>

          <div className="space-y-3">
            {vendorFaqs.map((faq, i) => (
              <AccordionItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* Section Acheteurs */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <ShoppingBag className="h-6 w-6 text-primary-blue" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">FAQ Acheteurs</h2>
              <p className="text-sm text-gray-500">Paiement, contact vendeur, signalement</p>
            </div>
          </div>

          <div className="space-y-3">
            {buyerFaqs.map((faq, i) => (
              <AccordionItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* CTA Bottom */}
        <div className="bg-gray-900 rounded-3xl sm:rounded-[40px] p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-black text-white mb-3">Vous n'avez pas trouvé votre réponse ?</h3>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">Notre équipe support répond sous 24 heures.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3.5 rounded-2xl font-bold transition-colors min-h-[52px]"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp Support
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-900 px-6 py-3.5 rounded-2xl font-bold transition-colors min-h-[52px]"
              >
                Nous écrire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
