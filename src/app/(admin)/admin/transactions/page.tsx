'use client'

import { useEffect, useState } from 'react'
import { CreditCard, ArrowUpRight, ArrowDownRight, Clock, User, ExternalLink, RefreshCw } from 'lucide-react'

interface Transaction {
    id: string
    amount: number
    status: 'PENDING' | 'SUCCESS' | 'FAILED'
    provider: string
    reference: string
    createdAt: string
    user: { email: string, name: string }
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchTransactions()
    }, [page])

    const fetchTransactions = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/admin/transactions?page=${page}`)
            if (response.ok) {
                const data = await response.json()
                setTransactions(data.transactions)
                setTotalPages(data.pagination.pages)
            }
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'text-green-600 bg-green-50 border-green-100'
            case 'FAILED': return 'text-red-600 bg-red-50 border-red-100'
            default: return 'text-amber-600 bg-amber-50 border-amber-100'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-8 h-8 text-primary-orange" />
                        Transactions Financières
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Historique des flux monétaires via Genius Pay.</p>
                </div>
                <button 
                    onClick={() => fetchTransactions()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse">
                            <div className="h-4 bg-gray-50 rounded w-1/4 mb-4"></div>
                            <div className="h-8 bg-gray-50 rounded w-full"></div>
                        </div>
                    ))
                ) : transactions.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200 text-gray-500">
                        Aucune transaction trouvée.
                    </div>
                ) : (
                    transactions.map((tx) => (
                        <div key={tx.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`p-3 rounded-xl border ${tx.status === 'SUCCESS' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                    {tx.status === 'SUCCESS' ? <ArrowUpRight className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="text-lg font-black text-gray-900">{tx.amount.toLocaleString()} FCFA</div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                        <User className="w-3 h-3" /> {tx.user.email}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(tx.status)}`}>
                                    {tx.status}
                                </div>
                                <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                    Réf: {tx.reference}
                                </div>
                                <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                    {new Date(tx.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
