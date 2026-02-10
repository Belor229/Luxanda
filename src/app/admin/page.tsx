'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Package,
  CreditCard,
  TrendingUp,
  MessageSquare,
  Settings,
  LogOut,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface DashboardStats {
  users: {
    total: number
    active: number
    vendors: number
  }
  products: {
    total: number
    active: number
    featured: number
  }
  subscriptions: {
    total: number
    active: number
    pending: number
  }
  revenue: {
    thisMonth: number
  }
}

interface RecentActivity {
  users: any[]
  products: any[]
  subscriptions: any[]
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const userRole = profile?.role?.toUpperCase()
      if (userRole !== 'ADMIN') {
        router.push('/')
        return
      }

      fetchDashboardData()
    }

    checkAdmin()
  }, [router])

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboardData()
    else if (activeTab === 'users') fetchUsers()
    else if (activeTab === 'products') fetchProducts()
    else if (activeTab === 'subscriptions') fetchSubscriptions()
    else if (activeTab === 'messages') fetchMessages()
  }, [activeTab])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentActivities(data.recentActivities)
      }
    } catch (err) { setError('Erreur de connexion') }
    finally { setLoading(false) }
  }

  const fetchUsers = async () => {
    setDataLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } finally { setDataLoading(false) }
  }

  const fetchProducts = async () => {
    setDataLoading(true)
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } finally { setDataLoading(false) }
  }

  const fetchSubscriptions = async () => {
    setDataLoading(true)
    try {
      const response = await fetch('/api/subscriptions/all')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions)
      }
    } finally { setDataLoading(false) }
  }

  const fetchMessages = async () => {
    setDataLoading(true)
    try {
      const response = await fetch('/api/admin/contact-messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } finally { setDataLoading(false) }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      if (response.ok) fetchUsers()
    } catch (err) { console.error(err) }
  }

  const handleUpdateProductStatus = async (productId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) fetchProducts()
    } catch (err) { console.error(err) }
  }

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administration Luxanda</h1>
              <p className="text-gray-600">Panneau de contrôle</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-6">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard'
                    ? 'bg-primary-orange text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>Tableau de bord</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users'
                    ? 'bg-primary-orange text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Users className="h-5 w-5" />
                  <span>Utilisateurs</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'products'
                    ? 'bg-primary-orange text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Package className="h-5 w-5" />
                  <span>Produits</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'subscriptions'
                    ? 'bg-primary-orange text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Abonnements</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'messages'
                    ? 'bg-primary-orange text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Messages</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Produits</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.products.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Abonnements actifs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.subscriptions.active}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Revenus ce mois</p>
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.revenue.thisMonth)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveaux utilisateurs</h3>
                  <div className="space-y-3">
                    {recentActivities?.users.map((user, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-orange rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {user.first_name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveaux produits</h3>
                  <div className="space-y-3">
                    {recentActivities?.products.map((product, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">Par {product.first_name}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Abonnements récents</h3>
                  <div className="space-y-3">
                    {recentActivities?.subscriptions.map((subscription, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {subscription.plan_type.toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {subscription.first_name} {subscription.last_name}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {subscription.status === 'active' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {subscription.status === 'pending' && (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          {subscription.status === 'cancelled' && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestion des utilisateurs</h2>
              {dataLoading ? <div className="loading-spinner mx-auto"></div> : (
                <table className="w-full text-left">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Utilisateur</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Rôle</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="px-4 py-3">{u.profile?.firstName} {u.profile?.lastName}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{u.role}</td>
                        <td className="px-4 py-3 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                            className="text-xs border rounded p-1"
                          >
                            <option value="USER">USER</option>
                            <option value="VENDOR">VENDOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestion des produits</h2>
              {dataLoading ? <div className="loading-spinner mx-auto"></div> : (
                <table className="w-full text-left">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Produit</th>
                      <th className="px-4 py-3">Vendeur</th>
                      <th className="px-4 py-3">Prix</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map(p => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-sm">{p.vendor?.user?.profile?.firstName}</td>
                        <td className="px-4 py-3 text-sm">{formatPrice(p.price)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 space-x-2">
                          <button onClick={() => handleUpdateProductStatus(p.id, 'ACTIVE')} className="text-green-600 hover:text-green-800"><CheckCircle className="h-4 w-4" /></button>
                          <button onClick={() => handleUpdateProductStatus(p.id, 'INACTIVE')} className="text-red-600 hover:text-red-800"><XCircle className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestion des abonnements</h2>
              {dataLoading ? <div className="loading-spinner mx-auto"></div> : (
                <table className="w-full text-left">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Vendeur</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3">Fin</th>
                      <th className="px-4 py-3">Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {subscriptions.map(s => (
                      <tr key={s.id}>
                        <td className="px-4 py-3">{s.user?.profile?.firstName}</td>
                        <td className="px-4 py-3 font-bold">{s.plan}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">{s.endDate ? new Date(s.endDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-4 py-3 text-xs font-mono">{s.paymentRef}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Messages de contact</h2>
              {dataLoading ? <div className="loading-spinner mx-auto"></div> : (
                <div className="space-y-4">
                  {messages.map(m => (
                    <div key={m.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold">{m.name}</span>
                        <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{m.email}</p>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded">{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
