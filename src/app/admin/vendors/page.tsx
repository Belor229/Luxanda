'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, X, AlertTriangle, MoreVertical, Search, Filter } from 'lucide-react'

interface Vendor {
    id: string
    storeName: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
    userId: string
    createdAt: string
    user: {
        email: string
        name: string
        phone: string | null
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
                // Refresh list
                fetchVendors(statusFilter)
            } else {
                alert('Erreur lors de la mise à jour')
            }
        } catch (error) {
            console.error('Error updating vendor:', error)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approuvé</span>
            case 'PENDING':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>
            case 'REJECTED':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejeté</span>
            case 'SUSPENDED':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Suspendu</span>
            default:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Vendeurs</h1>
                    <p className="text-sm text-gray-500">Gérez les inscriptions et les statuts des boutiques</p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value)
                            router.push(`/admin/vendors${e.target.value ? `?status=${e.target.value}` : ''}`)
                        }}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-orange focus:border-primary-orange sm:text-sm rounded-md"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="PENDING">En attente</option>
                        <option value="APPROVED">Approuvé</option>
                        <option value="REJECTED">Rejeté</option>
                        <option value="SUSPENDED">Suspendu</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Boutique / Vendeur
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Produits
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date d'inscription
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center">Chargement...</td>
                                </tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Aucun vendeur trouvé</td>
                                </tr>
                            ) : (
                                vendors.map((vendor) => (
                                    <tr key={vendor.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                                    {vendor.storeName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{vendor.storeName}</div>
                                                    <div className="text-sm text-gray-500">{vendor.user.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{vendor.user.email}</div>
                                            <div className="text-sm text-gray-500">{vendor.user.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(vendor.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {vendor._count.products}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(vendor.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex gap-2 justify-end">
                                                {vendor.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateVendorStatus(vendor.id, 'APPROVED')}
                                                            className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded"
                                                            title="Approuver"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateVendorStatus(vendor.id, 'REJECTED')}
                                                            className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded"
                                                            title="Rejeter"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {vendor.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => updateVendorStatus(vendor.id, 'SUSPENDED')}
                                                        className="text-orange-600 hover:text-orange-900 bg-orange-50 p-1 rounded"
                                                        title="Suspendre"
                                                    >
                                                        <AlertTriangle className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {vendor.status === 'SUSPENDED' && (
                                                    <button
                                                        onClick={() => updateVendorStatus(vendor.id, 'APPROVED')}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded"
                                                        title="Réactiver"
                                                    >
                                                        <Check className="h-4 w-4" />
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
