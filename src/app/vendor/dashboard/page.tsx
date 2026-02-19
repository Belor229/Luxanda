'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, Star, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface VendorData {
  id: string
  storeName: string
  status: string
  products: {
    id: string
    name: string
    price: number
    status: string
    quantity: number
  }[]
  subscription?: {
    plan: string
    status: string
    expiresAt: string | null
    trialEndDate: string | null
    isTrial: boolean
    amount: number
  }
}

export default function VendorDashboard() {
  const [vendor, setVendor] = useState<VendorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendorData()
  }, [])

  const fetchVendorData = async () => {
    try {
      const response = await fetch('/api/vendor/dashboard')
      if (response.ok) {
        const data = await response.json()
        // Transform the API response to match our interface
        setVendor({
          id: data.vendor?.id || '',
          storeName: data.vendor?.storeName || '',
          status: data.vendor?.status || 'PENDING',
          products: data.products || [],
          subscription: data.stats?.subscription
        })
      } else {
        // Fallback to old API
        const fallbackResponse = await fetch('/api/vendor')
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          setVendor(fallbackData)
        }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold text-gray-900">Bienvenue sur Luxanda</h2>
        <p className="mt-2 text-gray-600">Vous n'avez pas encore configuré votre boutique.</p>
        <Link href="/vendor/settings" className="mt-4 btn btn-primary inline-flex">
          Créer ma boutique
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500">
            Bienvenue, {vendor.storeName}
          </p>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${vendor.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
              vendor.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
            }`}>
            {vendor.status === 'APPROVED' ? 'Vendeur Vérifié' :
              vendor.status === 'PENDING' ? 'En attente de validation' : vendor.status}
          </span>
        </div>
      </div>

      {vendor.status === 'PENDING' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Votre compte vendeur est en cours d'examen par nos administrateurs.
                Vous pouvez ajouter des produits, mais ils ne seront visibles publiquement qu'après validation de votre compte.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Products Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Produits
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {vendor.products.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/vendor/products" className="font-medium text-primary-orange hover:text-orange-600">
                Gérer mes produits
              </Link>
            </div>
          </div>
        </div>

        {/* Subscription Plan Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Plan Actuel
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {vendor.subscription?.isTrial ? 'Essai Gratuit (2 mois)' : vendor.subscription?.plan || 'Aucun'}
                    </div>
                    {vendor.subscription?.trialEndDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Essai jusqu'au {new Date(vendor.subscription.trialEndDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/vendor/subscription" className="font-medium text-primary-orange hover:text-orange-600">
                {vendor.subscription?.isTrial ? 'Choisir un plan' : 'Voir les plans'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Derniers produits ajoutés
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {vendor.products.slice(0, 5).map((product) => (
            <li key={product.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-primary-orange truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(product.price)} • Stock: {product.quantity}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      product.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {product.status}
                  </span>
                </div>
              </div>
            </li>
          ))}
          {vendor.products.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-500">
              Aucun produit ajouté pour le moment.
            </li>
          )}
        </ul>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link href="/vendor/products" className="font-medium text-primary-orange hover:text-orange-600">
              Voir tous les produits
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
