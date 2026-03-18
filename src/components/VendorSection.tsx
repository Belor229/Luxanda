import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Store, Users, TrendingUp, Shield, ArrowRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function VendorSection() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })
  }, [])

  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Espace vendeurs
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8">
                Créez votre boutique en ligne et touchez des milliers de clients.
                Les abonnements sont gérés via Kkiapay pour une sécurité maximale.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Store, title: 'Boutique personnalisée', sub: 'Créez votre espace unique', color: 'orange' },
                { icon: Users, title: 'Clients ciblés', sub: 'Touchez votre audience', color: 'blue' },
                { icon: TrendingUp, title: 'Analytics avancés', sub: 'Suivez vos performances', color: 'green' },
                { icon: Shield, title: 'Paiements sécurisés', sub: 'Via Kkiapay', color: 'purple' }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className={`p-3 bg-${item.color}-100 rounded-lg`}>
                    <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link href="/vendor-subscription" className="btn btn-secondary text-lg px-8 py-3 translate-y-0 hover:-translate-y-1 transition-transform">
                Voir les abonnements
              </Link>
            </div>
          </div>

          <div className="relative">
            {user ? (
               <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative z-10">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-orange rounded-full flex items-center justify-center mx-auto mb-4">
                      <Store className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Ma Boutique
                    </h3>
                    <p className="text-gray-600">
                      Accédez à votre tableau de bord vendeur
                    </p>
                  </div>

                  <div className="pt-4">
                    <Link href="/vendor/dashboard" className="w-full btn btn-primary flex items-center justify-center gap-2">
                       Tableau de bord <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
                <div className="bg-gradient-to-br from-primary-blue to-primary-blue/90 rounded-[40px] shadow-2xl p-10 text-white relative z-10 overflow-hidden group">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10 text-center">
                        <h3 className="text-3xl font-black mb-4">Vendre sur Luxanda</h3>
                        <p className="text-white/80 text-lg mb-8">
                            Rejoignez +100 vendeurs de confiance et boostez votre visibilité au Bénin dès aujourd'hui.
                        </p>
                        <ul className="text-left space-y-3 mb-10 max-w-xs mx-auto">
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-primary-orange rounded-full"></div>
                                <span>14 jours gratuits d'essai</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-primary-orange rounded-full"></div>
                                <span>Zéro commission sur ventes</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-primary-orange rounded-full"></div>
                                <span>Support WhatsApp dédié</span>
                            </li>
                        </ul>
                        <Link href="/vendor-subscription" className="w-full bg-primary-orange hover:bg-orange-600 text-white text-lg font-bold py-4 rounded-2xl inline-flex items-center justify-center gap-2 transition-all transform hover:scale-105">
                            Créer ma boutique <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-orange/20 rounded-full animate-bounce-subtle"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary-blue/20 rounded-full animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </section>
  )
}
