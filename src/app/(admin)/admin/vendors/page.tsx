'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, X, AlertTriangle, MoreVertical, Search, Filter, ShieldCheck, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react'

interface Vendor {
    id: string
    storeName: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
    verified: boolean
    userId: string
    createdAt: string
    user: {
        email: string
        name: string
        profile?: {
            phone: string | null
        } | null
    }
    _count: {
        products: number
    }
}

export default function AdminVendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>('')
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const status = searchParams.get('status')
        if (status) setStatusFilter(status)
        fetchVendors(status || '')
    }, [searchParams])

    const fetchVendors = async (status: string) => {
        try {
            setLoading(true)
            const query = status ? `?status=${status}` : ''
            const response = await fetch(`/api/admin/vendors${query}`)
            const data = await response.json()
            if (response.ok) {
                setVendors(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error('Error fetching vendors:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateVendorStatus = async (vendorId: string, newStatus: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir changer le statut en ${newStatus} ?`)) return

        try {
            const response = await fetch(`/api/admin/vendors/${vendorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (response.ok) {
                fetchVendors(statusFilter)
            } else {
                alert('Erreur lors de la mise à jour')
            }
        } catch (error) {
            console.error('Error updating vendor:', error)
        }
    }

    const getStatusBadge = (status: string, verified: boolean) => {
        if (verified && status === 'APPROVED') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Vérifié
                </span>
            )
        }
        switch (status) {
            case 'PENDING':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">En attente</span>
            case 'REJECTED':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">Rejeté</span>
            case 'SUSPENDED':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">Suspendu</span>
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>
        }
    }

    return (
        <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestion des Vendeurs</h1>
                    <p className="text-gray-500 mt-1">Supervisez et modérez les boutiques de la marketplace</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value)
                                router.push(`/admin/vendors${e.target.value ? `?status=${e.target.value}` : ''}`)
                            }}
                            className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 focus:ring-2 focus:ring-primary-orange focus:border-transparent rounded-xl text-sm font-bold text-gray-700 shadow-sm transition-all"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="PENDING">En attente</option>
                            <option value="APPROVED">Vérifiés</option>
                            <option value="REJECTED">Rejetés</option>
                            <option value="SUSPENDED">Suspendus</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Boutique / Gérant</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date Adhésion</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-8 py-20 text-center"><div className="animate-spin h-8 w-8 border-4 border-primary-orange border-t-transparent rounded-full mx-auto"></div></td></tr>
                            ) : vendors.length === 0 ? (
                                <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium">Aucune boutique ne correspond à vos critères.</td></tr>
                            ) : (
                                vendors.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 bg-gradient-to-br from-primary-blue to-blue-600 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-500/20">
                                                    {vendor.storeName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-base font-extrabold text-gray-900 group-hover:text-primary-blue transition-colors">{vendor.storeName}</div>
                                                    <div className="text-xs text-gray-400 font-medium flex items-center">
                                                        <ShieldCheck className="w-3 h-3 mr-1" />
                                                        {vendor.user.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-gray-700 flex items-center"><Mail className="w-3 h-3 mr-2 text-gray-300" /> {vendor.user.email}</span>
                                                <span className="text-xs text-gray-400 font-medium flex items-center"><Phone className="w-3 h-3 mr-2 text-gray-300" /> {vendor.user.profile?.phone || 'Non renseigné'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            {getStatusBadge(vendor.status, vendor.verified)}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-700 flex items-center">
                                                <Calendar className="w-3 h-3 mr-2 text-gray-300" />
                                                {new Date(vendor.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                {vendor.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateVendorStatus(vendor.id, 'APPROVED')}
                                                            className="flex items-center justify-center h-10 w-10 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all font-bold"
                                                            title="Valider la boutique"
                                                        >
                                                            <Check className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateVendorStatus(vendor.id, 'REJECTED')}
                                                            className="flex items-center justify-center h-10 w-10 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all font-bold"
                                                            title="Rejeter"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {vendor.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => updateVendorStatus(vendor.id, 'SUSPENDED')}
                                                        className="flex items-center justify-center h-10 w-10 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all font-bold"
                                                        title="Suspendre"
                                                    >
                                                        <AlertTriangle className="h-5 w-5" />
                                                    </button>
                                                )}
                                                {(vendor.status === 'SUSPENDED' || vendor.status === 'REJECTED') && (
                                                    <button
                                                        onClick={() => updateVendorStatus(vendor.id, 'APPROVED')}
                                                        className="flex items-center justify-center h-10 w-10 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all font-bold"
                                                        title="Réactiver"
                                                    >
                                                        <Check className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
