'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    
    // Simuler l'envoi de l'email
    setTimeout(() => {
      setIsSubscribed(true)
      setIsLoading(false)
      setEmail('')
    }, 2000)
  }

  if (isSubscribed) {
    return (
      <section className="section-padding bg-gradient-to-r from-primary-blue to-primary-orange">
        <div className="container-custom">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Merci pour votre inscription !
            </h2>
            <p className="text-xl opacity-90">
              Vous recevrez bientôt nos dernières actualités et promotions.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-gradient-to-r from-primary-blue to-primary-orange">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Restez informé
            </h2>
            <p className="text-xl opacity-90">
              Abonnez-vous à notre newsletter pour recevoir les dernières boutiques, 
              promotions et conseils pour réussir en ligne.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>S'abonner</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-sm opacity-75 mt-4">
            Nous respectons votre vie privée. Désabonnez-vous à tout moment.
          </p>
        </div>
      </div>
    </section>
  )
}
