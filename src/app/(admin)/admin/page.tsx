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
  activeSubscriptions: number
  totalReports: number
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Users Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-blue-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Utilisateurs</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats?.totalUsers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Vendors Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-orange-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Store className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Vendeurs</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats?.totalVendors || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-green-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Produits</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats?.totalProducts || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-purple-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Abonnements</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats?.activeSubscriptions || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-red-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Signalements</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats?.totalReports || 0}</dd>
                </dl>
              </div>
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
