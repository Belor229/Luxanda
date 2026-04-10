'use client'

import { useEffect, useState } from 'react'
import { Rocket, Zap, Crown, Clock, Calendar, User, Search, Filter, ShieldCheck, XCircle } from 'lucide-react'

interface Subscription {
    id: string
    plan: 'STARTER' | 'PRO' | 'PREMIUM'
    amount: number
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING'
    startDate: string
    endDate: string
    user: { email: string, name: string }
    vendor: { storeName: string }
}

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchSubscriptions()
    }, [page])

    const fetchSubscriptions = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/admin/subscriptions?page=${page}`)
            if (response.ok) {
                const data = await response.json()
                setSubscriptions(data.subscriptions)
                setTotalPages(data.pagination.pages)
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error)
        } finally {
            setLoading(false)
        }
    }

    const getPlanIcon = (plan: string) => {
        switch (plan) {
            case 'STARTER': return <Rocket className="w-4 h-4 text-blue-500" />
            case 'PRO': return <Zap className="w-4 h-4 text-orange-500" />
            case 'PREMIUM': return <Crown className="w-4 h-4 text-purple-500" />
            default: return null
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700'
            case 'CANCELLED': return 'bg-red-100 text-red-700'
            case 'EXPIRED': return 'bg-gray-100 text-gray-700'
            default: return 'bg-yellow-100 text-yellow-700'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Abonnements Vendeurs</h1>
                    <p className="text-sm text-gray-500 mt-1">Suivi des plans actifs et des revenus récurrents.</p>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendeur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validité</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded"></div></td>
                                    </tr>
                                ))
                            ) : subscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{sub.vendor?.storeName || 'Luxanda'}</div>
                                        <div className="text-xs text-gray-500">{sub.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getPlanIcon(sub.plan)}
                                            <span className="text-sm font-medium">{sub.plan}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold">
                                        {sub.amount.toLocaleString()} FCFA
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(sub.status)}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-600">Du {new Date(sub.startDate!).toLocaleDateString()}</div>
                                        <div className="text-xs font-bold text-red-500">Au {new Date(sub.endDate!).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-red-600 transition-colors">
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
