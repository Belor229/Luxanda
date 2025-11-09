'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Share2,
  Users,
  DollarSign,
  Copy,
  CheckCircle,
  TrendingUp,
  Clock,
  ExternalLink,
  MessageCircle,
  Mail,
  Facebook,
  Twitter
} from 'lucide-react'

interface AffiliationStats {
  totalReferrals: number
  totalEarnings: number
  pendingEarnings: number
}

interface Referral {
  id: number
  commission_amount: number
  status: 'pending' | 'paid' | 'cancelled'
  created_at: string
  first_name: string
  last_name: string
  email: string
}

export default function AffiliationPage() {
  const [affiliationLink, setAffiliationLink] = useState('')
  const [stats, setStats] = useState<AffiliationStats>({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  })
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchAffiliationData()
  }, [])

  const fetchAffiliationData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/affiliation/my-affiliation', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAffiliationLink(data.affiliationLink)
        setStats(data.stats)
        setReferrals(data.recentReferrals)
      } else {
        setError('Erreur lors du chargement des données d\'affiliation')
      }
    } catch (error) {
      console.error('Affiliation fetch error:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(affiliationLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
    }
  }

  const shareOnSocial = (platform: string) => {
    const message = `Découvrez Luxanda, la marketplace africaine qui inspire confiance ! Créez votre boutique en ligne et vendez vos produits facilement. Inscrivez-vous avec mon lien : ${affiliationLink}`
    const encodedMessage = encodeURIComponent(message)

    let url = ''
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedMessage}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(affiliationLink)}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedMessage}`
        break
      case 'email':
        url = `mailto:?subject=Découvrez Luxanda&body=${encodedMessage}`
        break
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payé'
      case 'pending':
        return 'En attente'
      case 'cancelled':
        return 'Annulé'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-blue to-primary-orange py-16">
        <div className="container-custom">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Programme d'Affiliation</h1>
            <p className="text-xl opacity-90">
              Gagnez des commissions en parrainant de nouveaux vendeurs
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-16">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Parrainages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gains Totaux</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEarnings.toFixed(0)} FCFA</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingEarnings.toFixed(0)} FCFA</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Affiliation Link */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Votre Lien de Parrainage</h2>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 p-4 bg-gray-50 rounded-lg border">
                <code className="text-sm text-gray-700 break-all">{affiliationLink}</code>
              </div>
              <button
                onClick={copyToClipboard}
                className="btn btn-primary flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>

            {/* Share Buttons */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Partager sur :</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => shareOnSocial('whatsapp')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => shareOnSocial('facebook')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => shareOnSocial('twitter')}
                  className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                  <span>Twitter</span>
                </button>
                <button
                  onClick={() => shareOnSocial('email')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Info */}
        <div className="bg-gradient-to-r from-primary-blue to-primary-orange rounded-lg p-8 mb-12 text-white">
          <h2 className="text-2xl font-bold mb-4">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">1. Partagez votre lien</h3>
              <p className="text-sm opacity-90">Partagez votre lien unique avec vos contacts</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">2. Ils s'inscrivent</h3>
              <p className="text-sm opacity-90">Vos contacts s'inscrivent via votre lien</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">3. Gagnez des commissions</h3>
              <p className="text-sm opacity-90">Recevez 30% de commission sur leurs abonnements</p>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Parrainages Récents</h2>
          
          {referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Commission</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {referral.first_name} {referral.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{referral.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900">
                          {referral.commission_amount.toFixed(0)} FCFA
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                          {getStatusText(referral.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {new Date(referral.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun parrainage</h3>
              <p className="text-gray-600 mb-6">Commencez à partager votre lien pour gagner des commissions !</p>
              <button
                onClick={copyToClipboard}
                className="btn btn-primary"
              >
                Copier mon lien de parrainage
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
