import { Users, Shield, MessageCircle, Crown, Award, Clock, Users as UsersIcon, Star } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Mise en relation',
    description: 'Nous connectons vendeurs et acheteurs de manière sécurisée et transparente',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Shield,
    title: 'Confiance',
    description: 'Vendeurs vérifiés progressivement pour garantir la qualité des transactions',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp direct',
    description: 'Échangez facilement avec les vendeurs via WhatsApp pour une communication fluide',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    icon: Crown,
    title: 'Abonnements vendeurs',
    description: 'Paiement sécurisé via Kkiapay pour tous vos abonnements',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: Award,
    title: 'Programme de récompenses',
    description: 'Gagnez des points à chaque achat et convertissez-les en réductions',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    icon: Clock,
    title: 'Support 24/7',
    description: 'Notre équipe est disponible pour vous accompagner à tout moment',
    color: 'bg-red-100 text-red-600'
  },
  {
    icon: UsersIcon,
    title: 'Communauté active',
    description: 'Rejoignez une communauté dynamique de vendeurs et d\'acheteurs',
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    icon: Star,
    title: 'Qualité garantie',
    description: 'Tous nos produits sont vérifiés pour assurer la meilleure qualité',
    color: 'bg-pink-100 text-pink-600'
  }
]

export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Pourquoi choisir Luxanda ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les avantages qui font de Luxanda la marketplace de référence en Afrique
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-orange to-primary-blue mx-auto rounded-full mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
