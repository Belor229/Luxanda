'use client'

import { useEffect, useState } from 'react'
import { Package, Search, Filter, ChevronRight, CheckCircle, XCircle, Truck } from 'lucide-react'
import Link from 'next/link'

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/vendor/orders')
            if (response.ok) {
                const data = await response.json()
                setOrders(data)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/vendor/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (response.ok) {
                fetchOrders() // Refresh
            }
        } catch (error) {
            console.error('Error updating order status:', error)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(price)
    }

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter)

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="loading-spinner"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h1>
                    <p className="text-sm text-gray-500">Suivez et gérez les ventes de votre boutique</p>
                </div>

                <div className="flex items-center space-x-2 bg-white p-1 rounded-lg shadow-sm border border-gray-100">
                    {['all', 'pending', 'confirmed', 'delivered', 'cancelled'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase ${filter === f ? 'bg-primary-orange text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {f === 'all' ? 'Tous' : f === 'pending' ? 'Attente' : f === 'confirmed' ? 'Confirmé' : f === 'delivered' ? 'Livré' : 'Annulé'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Commande</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-gray-900">#{order.id.slice(0, 8)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="font-bold text-gray-900">{order.profile?.full_name || 'Client'}</p>
                                            <p className="text-gray-500">{order.phone_contact}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        {formatPrice(order.total_amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'pending' ? 'bg-blue-50 text-blue-600' :
                                            order.status === 'confirmed' ? 'bg-orange-50 text-orange-600' :
                                                order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {order.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                                    className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg title='Confirmer'"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg title='Annuler'"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg title='Marquer comme livré'"
                                            >
                                                <Truck className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredOrders.length === 0 && (
                        <div className="p-12 text-center">
                            <Package className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande trouvée</h3>
                            <p className="mt-1 text-sm text-gray-500">Les commandes de vos clients apparaîtront ici.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
