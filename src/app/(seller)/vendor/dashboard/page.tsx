'use client'

import { Suspense, useEffect, useState } from 'react'
import { ShoppingBag, Star, TrendingUp, AlertCircle, Package, Calendar, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface VendorData {
  vendor: {
    id: string
    storeName: string
    status: string
  }
  stats: {
    products: { total: number; active: number }
    orders: { pending: number; revenue: number }
    subscription?: {
      plan: string
      status: string
      expiresAt: string | null
      isTrial: boolean
      daysLeft: number
    }
  }
  products: any[]
  orders: any[]
}

function VendorDashboardContent() {
  const [data, setData] = useState<VendorData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchVendorData()
  }, [])

  const fetchVendorData = async () => {
    try {
      const response = await fetch('/api/vendor/dashboard')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price)
  }

  const sanitizeImageUrl = (url: string) => {
    if (!url) return ''
    const protocolRegex = /^(https?:\/\/|data:image\/|\/)/i
    if (typeof url === 'string' && protocolRegex.test(url)) {
      return url
    }
    return ''
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="animate-spin h-10 w-10 border-4 border-primary-orange border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[500px] gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-primary-orange border-t-transparent rounded-full"></div>
        <p className="text-gray-500 font-bold">Initialisation de votre espace vendeur...</p>
      </div>
    )
  }

  const showSubmissionSuccess = searchParams.get('submission') === 'success'
  const showProfileComplete = searchParams.get('profile') === 'complete'

  // ── INCOMPLETE: profile not completed yet ──
  if (data.vendor.status === 'INCOMPLETE') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 max-w-2xl w-full text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-orange/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 font-sans">
            <div className="bg-orange-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="h-12 w-12 text-primary-orange" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Complétez votre profil</h2>
            <p className="text-gray-500 font-medium text-lg leading-relaxed mb-10 max-w-md mx-auto">
              Pour activer votre boutique sur Luxanda, vous devez d'abord compléter votre profil vendeur avec les informations essentielles.
            </p>
            <Link
              href="/vendor/complete-profile"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary-orange text-white px-10 py-5 rounded-2xl font-black text-lg transition-all hover:bg-orange-600 shadow-xl shadow-orange-500/20 active:scale-95"
            >
              Compléter mon profil
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── PENDING: awaiting admin validation ──
  if (data.vendor.status === 'PENDING') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 max-w-2xl w-full text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-orange/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 font-sans">
            <div className="bg-yellow-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <ShieldCheck className="h-12 w-12 text-yellow-600" />
            </div>
            {showProfileComplete && (
              <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-2xl font-bold text-sm">
                Votre profil vendeur a bien été soumis pour validation.
              </div>
            )}
            {showSubmissionSuccess && (
              <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-2xl font-bold text-sm">
                Votre dossier vendeur a bien été envoyé à l&apos;administration.
              </div>
            )}
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Votre compte est en cours de validation</h2>
            <p className="text-gray-500 font-medium text-lg leading-relaxed mb-6 max-w-md mx-auto">
              Notre équipe examine votre profil pour assurer la sécurité de la marketplace. Vous serez notifié dès que votre compte sera validé.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl mb-6">
              <p className="text-sm text-yellow-800 font-bold text-center">
                ⏰ Délai de validation : 24 à 48 heures
              </p>
            </div>
            <div className="animate-pulse flex items-center justify-center gap-2 text-primary-orange font-bold uppercase tracking-widest text-xs">
              <Package className="w-4 h-4" /> Validation en cours...
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── REJECTED ──
  if (data.vendor.status === 'REJECTED') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 max-w-2xl w-full text-center relative overflow-hidden">
          <div className="relative z-10 font-sans">
            <div className="bg-red-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Demande refusée</h2>
            <p className="text-gray-500 font-medium text-lg leading-relaxed mb-6 max-w-md mx-auto">
              Votre demande de compte vendeur a été refusée par notre équipe. Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black transition-all hover:bg-black"
            >
              Contacter le support
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── SUSPENDED ──
  if (data.vendor.status === 'SUSPENDED') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 max-w-2xl w-full text-center">
          <div className="bg-gray-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="h-12 w-12 text-gray-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Compte suspendu</h2>
          <p className="text-gray-500 font-medium text-lg mb-6 max-w-md mx-auto">
            Votre compte vendeur a été temporairement suspendu. Veuillez contacter le support pour plus d'informations.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-black">
            Contacter le support
          </Link>
        </div>
      </div>
    )
  }

  // ── APPROVED: Full dashboard ──
  const isTrialActive = data.stats.subscription?.isTrial && data.stats.subscription.daysLeft > 0

  return (
    <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{data.vendor.storeName}</h1>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-green-100 text-green-700 border border-green-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Vendeur vérifié
            </span>
          </div>
          <p className="text-gray-500 font-medium">
            Votre centre d'affaires en ligne
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/products" className="text-sm font-bold text-primary-blue hover:text-blue-700 flex items-center transition-colors">
            Voir ma boutique <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Trial Alert Banner */}
      {isTrialActive && (
        <div className="bg-gradient-to-r from-primary-orange to-orange-600 p-1 rounded-2xl shadow-lg shadow-orange-500/20">
          <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center text-center sm:text-left">
              <div className="bg-orange-100 p-3 rounded-xl mr-4 hidden sm:block">
                <Star className="text-primary-orange h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-lg">Offre Spéciale : 14 jours offerts !</h3>
                <p className="text-sm text-gray-600 font-medium">Profitez de toutes les fonctionnalités Premium gratuitement pendant encore <span className="text-primary-orange font-black">{data.stats.subscription?.daysLeft} jours</span>.</p>
              </div>
            </div>
            <Link href="/vendor/subscription" className="btn btn-primary px-6 py-2.5 text-sm font-bold shadow-lg shadow-primary-orange/20 whitespace-nowrap">
              Voir mon offre
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-green-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Revenue</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{formatPrice(data.stats.orders.revenue)}</p>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <Link href="/vendor/orders" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Voir tout</Link>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Commandes</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{data.stats.orders.pending}</p>
          <p className="text-xs text-blue-500 font-bold mt-2">En attente de traitement</p>
        </div>

        {/* Products Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-orange-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-2xl group-hover:scale-110 transition-transform">
              <ShoppingBag className="h-6 w-6 text-orange-600" />
            </div>
            <Link href="/vendor/products" className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">Gérer</Link>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Produits</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{data.stats.products.total}</p>
          <p className="text-xs text-orange-500 font-bold mt-2">{data.stats.products.active} articles approuvés</p>
        </div>

        {/* Subscription Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-2xl group-hover:scale-110 transition-transform">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <Link href="/vendor/subscription" className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline">Détails</Link>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Abonnement</p>
          <p className="text-xl font-black text-gray-900 mt-1 truncate">{data.stats.subscription?.plan || 'Gratuit'}</p>
          <p className="text-xs text-purple-500 font-bold mt-2 flex items-center">
            {isTrialActive ? (
              <><Star className="w-3 h-3 mr-1 fill-purple-500" /> Essai en cours</>
            ) : (
              'Plan Standard'
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders List */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900">Ventes récentes</h3>
            <Link href="/vendor/orders" className="text-xs font-black text-primary-orange uppercase tracking-widest">Historique complet</Link>
          </div>
          <div className="space-y-6">
            {data.orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 font-black text-sm group-hover:bg-primary-blue group-hover:text-white transition-all">
                    {(order.profile?.full_name || 'C').charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-black text-gray-900 truncate max-w-[140px]">{order.profile?.full_name || 'Client anonyme'}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{formatPrice(order.total_amount)}</p>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${order.status === 'pending' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    order.status === 'confirmed' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {data.orders.length === 0 && (
              <div className="py-10 text-center">
                <Package className="h-10 w-10 text-gray-100 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-bold italic">Aucune commande pour le moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Overview */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900">Articles populaires</h3>
            <Link href="/vendor/products" className="text-xs font-black text-primary-orange uppercase tracking-widest">Tout le catalogue</Link>
          </div>
          <div className="space-y-6">
            {data.products.map((product) => (
              <div key={product.id} className="flex items-center space-x-4 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform">
                  {product.image_urls?.[0] ? (
                    <img
                      src={sanitizeImageUrl(product.image_urls[0])}
                      alt={product.title}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  ) : (
                    <ShoppingBag className="text-gray-300 w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-gray-900 truncate">{product.title || product.name}</p>
                    <span className="text-sm font-black text-primary-orange">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden mr-3">
                      <div className={`h-full rounded-full ${product.stock < 5 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (product.stock / 20) * 100)}%` }}></div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Stock: {product.stock}</span>
                  </div>
                </div>
              </div>
            ))}
            {data.products.length === 0 && (
              <div className="py-10 text-center">
                <ShoppingBag className="h-10 w-10 text-gray-100 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-bold italic">Ajoutez votre premier produit.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VendorDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-full min-h-[500px]">
          <div className="animate-spin h-10 w-10 border-4 border-primary-orange border-t-transparent rounded-full" />
        </div>
      }
    >
      <VendorDashboardContent />
    </Suspense>
  )
}
