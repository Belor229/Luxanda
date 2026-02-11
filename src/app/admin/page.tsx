'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  Users,
  Store,
  ShoppingBag,
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalUsers: number
  totalVendors: number
  totalProducts: number
  pendingVendors: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Users Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Utilisateurs Total
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats?.totalUsers || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/users" className="font-medium text-primary-orange hover:text-orange-600">
                Voir tout
              </Link>
            </div>
          </div>
        </div>

        {/* Vendors Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Store className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Vendeurs
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats?.totalVendors || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/vendors" className="font-medium text-primary-orange hover:text-orange-600">
                Voir tout
              </Link>
            </div>
          </div>
        </div>

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
                    Produits
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats?.totalProducts || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/products" className="font-medium text-primary-orange hover:text-orange-600">
                Voir tout
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Vendors Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-400">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Vendeurs en attente
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats?.pendingVendors || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/vendors?status=PENDING" className="font-medium text-primary-orange hover:text-orange-600 flex items-center">
                Review requests <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section could go here */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/vendors?status=PENDING" className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-orange transition-colors">
            <h3 className="font-medium text-gray-900">Valider les vendeurs</h3>
            <p className="mt-2 text-sm text-gray-500">Examiner les demandes d'inscription des nouveaux vendeurs.</p>
          </Link>
          {/* Add more quick actions */}
        </div>
      </div>
    </div>
  )
}
