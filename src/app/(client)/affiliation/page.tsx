import Link from 'next/link'
import { Rocket } from 'lucide-react'

export default function AffiliationComingSoon() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-primary-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Rocket className="h-10 w-10 text-primary-orange animate-bounce" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4 text-balanced">
          Programme d'Affiliation
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Notre programme d'affiliation arrive très bientôt ! Préparez-vous à gagner des commissions en recommandant Luxanda.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn btn-primary px-8">
            Retour à l'accueil
          </Link>
          <Link href="/contact" className="btn btn-outline px-8">
            Être notifié
          </Link>
        </div>
      </div>
    </div>
  )
}
