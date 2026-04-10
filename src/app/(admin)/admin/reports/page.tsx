'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Clock, Trash2, Eye, User, ShoppingBag, Store } from 'lucide-react'

interface Report {
    id: string
    reason: string
    details?: string
    status: 'PENDING' | 'RESOLVED' | 'DISMISSED'
    createdAt: string
    reporter: { email: string, name: string }
    vendor?: { storeName: string, id: string }
    product?: { name: string, id: string }
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/reports')
            if (response.ok) {
                const data = await response.json()
                setReports(data)
            }
        } catch (error) {
            console.error('Error fetching reports:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (reportId: string, action: string) => {
        if (!confirm(`Confirmer l'action : ${action} ?`)) return
        try {
            const response = await fetch('/api/admin/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportId, action })
            })
            if (response.ok) {
                fetchReports()
            }
        } catch (error) {
            console.error('Error handling report:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-8 h-8" />
                    Signalements & Fraude
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Gérez les alertes de sécurité et les signalements de contenu inapproprié.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Aucun signalement en attente. Tout est calme !</p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${report.status === 'PENDING' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {report.status}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {new Date(report.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-gray-900">{report.reason}</h3>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">{report.details || 'Aucun détail supplémentaire.'}</p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <User className="w-4 h-4 mr-2 text-gray-300" />
                                            Signalé par : <span className="font-bold ml-1 text-gray-700">{report.reporter.name || report.reporter.email}</span>
                                        </div>
                                        {report.vendor && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Store className="w-4 h-4 mr-2 text-gray-300" />
                                                Cible (Vendeur) : <span className="font-bold ml-1 text-gray-700">{report.vendor.storeName}</span>
                                            </div>
                                        )}
                                        {report.product && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <ShoppingBag className="w-4 h-4 mr-2 text-gray-300" />
                                                Cible (Produit) : <span className="font-bold ml-1 text-gray-700">{report.product.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex md:flex-col gap-2 justify-end">
                                    {report.status === 'PENDING' && (
                                        <>
                                            <button 
                                                onClick={() => handleAction(report.id, 'RESOLVE')}
                                                className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Traité
                                            </button>
                                            <button 
                                                onClick={() => handleAction(report.id, 'DISMISS')}
                                                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" /> Ignorer
                                            </button>
                                        </>
                                    )}
                                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                        <Eye className="w-4 h-4" /> Détails
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
