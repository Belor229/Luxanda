'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, X, AlertTriangle, Search, Filter, ShieldCheck, Mail, Phone, Calendar, Eye, FileText, User as UserIcon } from 'lucide-react'

interface Vendor {
    id: string
    storeName: string
    status: 'INCOMPLETE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
    id_card_url: string | null
    selfie_url: string | null
    ifu_url?: string | null
    rccm_url?: string | null
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

function AdminVendorsContent() {
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
    const [showDocModal, setShowDocModal] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
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
            setFetchError(null)
            const query = status ? `?status=${encodeURIComponent(status)}` : ''
            const response = await fetch(`/api/admin/vendors${query}`, { credentials: 'include' })
            const data = await response.json()
            if (response.ok) {
                setVendors(Array.isArray(data) ? data : [])
            } else {
                setVendors([])
                setFetchError(data?.error || `Erreur ${response.status} — impossible de charger les vendeurs.`)
            }
        } catch (error) {
            console.error('Error fetching vendors:', error)
            setFetchError('Erreur réseau lors du chargement des vendeurs.')
            setVendors([])
        } finally {
            setLoading(false)
        }
    }

    const updateVendorStatus = async (vendorId: string, action: 'approve' | 'reject' | 'suspend', reason?: string) => {
        if (action === 'reject' && !reason) {
            alert('Veuillez saisir un motif de rejet.')
            return
        }

        const actionLabel = action === 'approve' ? 'Valider' : action === 'reject' ? 'Refuser' : 'Suspendre'
        if (!confirm(`Confirmer l'action : ${actionLabel} ?`)) return

        try {
            setIsSubmitting(true)
            const response = await fetch(`/api/admin/vendors`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendor_id: vendorId,
                    action,
                    reason
                })
            })

            if (response.ok) {
                fetchVendors(statusFilter)
                setShowDocModal(false)
                setRejectionReason('')
            } else {
                const err = await response.json()
                alert(err.error || 'Erreur lors de la mise à jour')
            }
        } catch (error) {
            console.error('Error updating vendor:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Vendeur vérifié
                    </span>
                )
            case 'INCOMPLETE':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">Profil incomplet</span>
            case 'PENDING':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">En attente de validation</span>
            case 'REJECTED':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">Refusé</span>
            case 'SUSPENDED':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">Suspendu</span>
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>
        }
    }

    return (
        <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen relative isolate">
            {fetchError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800 shadow-sm">
                    {fetchError}
                </div>
            )}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestion des Vendeurs</h1>
                    <p className="text-gray-500 mt-1">Supervisez et modérez les boutiques de la marketplace</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative z-10 min-w-[200px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value)
                                router.push(`/admin/vendors${e.target.value ? `?status=${e.target.value}` : ''}`)
                            }}
                            className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 focus:ring-2 focus:ring-primary-orange focus:border-transparent rounded-xl text-sm font-bold text-gray-700 shadow-sm transition-all"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="INCOMPLETE">Profils incomplets</option>
                            <option value="PENDING">En attente de validation</option>
                            <option value="APPROVED">Vendeurs vérifiés</option>
                            <option value="REJECTED">Refusés</option>
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
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Produits</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-8 py-20 text-center"><div className="animate-spin h-8 w-8 border-4 border-primary-orange border-t-transparent rounded-full mx-auto"></div></td></tr>
                            ) : vendors.length === 0 ? (
                                <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-medium">Aucune boutique ne correspond à vos critères.</td></tr>
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
                                                        <UserIcon className="w-3 h-3 mr-1" />
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
                                            {getStatusBadge(vendor.status)}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-700">{vendor._count.products}</span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-700 flex items-center">
                                                <Calendar className="w-3 h-3 mr-2 text-gray-300" />
                                                {new Date(vendor.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setSelectedVendor(vendor)
                                                        setShowDocModal(true)
                                                    }}
                                                    className="flex items-center justify-center h-10 w-10 bg-primary-blue text-white rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all font-bold"
                                                    title="Voir le profil"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                                {vendor.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateVendorStatus(vendor.id, 'approve')}
                                                            className="flex items-center justify-center h-10 w-10 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all font-bold"
                                                            title="Valider le vendeur"
                                                        >
                                                            <Check className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedVendor(vendor)
                                                                setShowDocModal(true)
                                                            }}
                                                            className="flex items-center justify-center h-10 w-10 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all font-bold"
                                                            title="Refuser le vendeur"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {vendor.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => updateVendorStatus(vendor.id, 'suspend')}
                                                        className="flex items-center justify-center h-10 w-10 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all font-bold"
                                                        title="Suspendre"
                                                    >
                                                        <AlertTriangle className="h-5 w-5" />
                                                    </button>
                                                )}
                                                {(vendor.status === 'SUSPENDED' || vendor.status === 'REJECTED') && (
                                                    <button
                                                        onClick={() => updateVendorStatus(vendor.id, 'approve')}
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

            {/* Vendor Detail / Review Modal */}
            {showDocModal && selectedVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Profil vendeur : {selectedVendor.storeName}</h2>
                                <p className="text-sm text-gray-500 font-medium mt-1">
                                    {selectedVendor.status === 'PENDING' ? 'En attente de votre validation' : 
                                     selectedVendor.status === 'APPROVED' ? 'Vendeur vérifié' :
                                     selectedVendor.status === 'REJECTED' ? 'Demande refusée' : selectedVendor.status}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDocModal(false)}
                                className="p-3 bg-white hover:bg-gray-100 rounded-2xl transition-colors shadow-sm"
                            >
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* ID Card */}
                            <div className="space-y-4">
                                <h3 className="flex items-center text-sm font-black text-gray-400 uppercase tracking-widest">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Pièce d'identité
                                </h3>
                                <div className="aspect-[3/2] bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center">
                                    {selectedVendor.id_card_url ? (
                                        <img src={selectedVendor.id_card_url} alt="ID Card" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-12 h-12 bg-gray-200 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                                                <X className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-400">Aucun document</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selfie */}
                            <div className="space-y-4">
                                <h3 className="flex items-center text-sm font-black text-gray-400 uppercase tracking-widest">
                                    <UserIcon className="w-4 h-4 mr-2" />
                                    Selfie de vérification
                                </h3>
                                <div className="aspect-[3/2] bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center">
                                    {selectedVendor.selfie_url ? (
                                        <img src={selectedVendor.selfie_url} alt="Selfie" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-12 h-12 bg-gray-200 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                                                <X className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-400">Aucun document</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* IFU */}
                            <div className="space-y-4">
                                <h3 className="flex items-center text-sm font-black text-gray-400 uppercase tracking-widest">
                                    <FileText className="w-4 h-4 mr-2" />
                                    IFU (Optionnel)
                                </h3>
                                <div className="aspect-[3/2] bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center">
                                    {selectedVendor.ifu_url ? (
                                        <img src={selectedVendor.ifu_url} alt="IFU" className="w-full h-full object-contain" />
                                    ) : (
                                        <p className="text-sm font-bold text-gray-300 italic">Non fourni</p>
                                    )}
                                </div>
                            </div>

                            {/* RCCM */}
                            <div className="space-y-4">
                                <h3 className="flex items-center text-sm font-black text-gray-400 uppercase tracking-widest">
                                    <FileText className="w-4 h-4 mr-2" />
                                    RCCM (Optionnel)
                                </h3>
                                <div className="aspect-[3/2] bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center">
                                    {selectedVendor.rccm_url ? (
                                        <img src={selectedVendor.rccm_url} alt="RCCM" className="w-full h-full object-contain" />
                                    ) : (
                                        <p className="text-sm font-bold text-gray-300 italic">Non fourni</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 space-y-4">
                            {selectedVendor.status === 'PENDING' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Motif en cas de refus (obligatoire pour refuser)</label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Ex: Informations de boutique incomplètes, Description insuffisante..."
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all outline-none"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => updateVendorStatus(selectedVendor.id, 'reject', rejectionReason)}
                                            disabled={isSubmitting || !rejectionReason.trim()}
                                            className="px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-colors disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Traitement...' : 'Refuser'}
                                        </button>
                                        <button
                                            onClick={() => updateVendorStatus(selectedVendor.id, 'approve')}
                                            disabled={isSubmitting}
                                            className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black hover:bg-green-600 shadow-xl shadow-green-500/20 transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Traitement...' : 'Valider le vendeur ✓'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {selectedVendor.status !== 'PENDING' && (
                                <button
                                    onClick={() => setShowDocModal(false)}
                                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all"
                                >
                                    Fermer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function AdminVendorsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
            <AdminVendorsContent />
        </Suspense>
    )
}
