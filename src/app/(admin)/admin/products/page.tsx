'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Trash2, Search, Filter, Eye, Check, ShieldCheck, X, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
    id: string
    name: string
    price: number
    status: string
    quantity: number
    images: string[]
    featured?: boolean
    category: { name: string } | null
    vendor: { storeName: string } | null
    createdAt: string
}

function AdminProductsContent() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [listError, setListError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
    const searchParams = useSearchParams()
    const router = useRouter()

    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''

    useEffect(() => {
        fetchProducts()
    }, [page, search])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            setListError(null)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search })
            })
            const response = await fetch(`/api/admin/products?${params}`, { credentials: 'include' })
            const data = await response.json()
            if (response.ok) {
                setProducts(data.products || [])
                setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
            } else {
                setProducts([])
                setListError(data?.error || `Erreur ${response.status}`)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            setListError('Erreur réseau')
        } finally {
            setLoading(false)
        }
    }

    const toggleFeatured = async (id: string, current: boolean) => {
        try {
            const response = await fetch(`/api/admin/products/${id}/featured`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featured: !current }),
            })
            if (response.ok) {
                fetchProducts()
            } else {
                const err = await response.json()
                alert(err.error || 'Erreur')
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleModerationAction = async (productId: string, action: 'approve' | 'reject' | 'suspect', reason?: string) => {
        if (!confirm(`Confirmer l'action : ${action} sur ce produit ?`)) return
        try {
            const response = await fetch(`/api/admin/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, action, reason })
            })

            if (response.ok) {
                fetchProducts()
            } else {
                const err = await response.json()
                alert(err.error || 'Erreur lors de la modération')
            }
        } catch (error) {
            console.error('Error updating product moderation:', error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) return

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            if (response.ok) {
                fetchProducts()
            } else {
                alert('Erreur lors de la suppression')
            }
        } catch (error) {
            console.error('Error deleting product:', error)
        }
    }

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const searchQuery = formData.get('search') as string
        router.push(`/admin/products?search=${searchQuery}`)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(price)
    }

    return (
        <div className="space-y-6 relative isolate">
            {listError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                    {listError}
                </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
                    <p className="text-sm text-gray-500">Modération, statuts et mise en vedette (CDC MVP)</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <input
                            name="search"
                            defaultValue={search}
                            type="text"
                            placeholder="Rechercher..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <button type="submit" className="btn btn-primary px-4 py-2">
                        Rechercher
                    </button>
                </form>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Produit
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vendeur
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Catégorie
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Prix / Stock
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vedette
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center">Chargement...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Aucun produit trouvé</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 relative">
                                                    <Image
                                                        src={product.images[0] || '/images/placeholder-product.jpg'}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover rounded"
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs" title={product.name}>
                                                        {product.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{product.vendor?.storeName || 'Luxanda'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{product.category?.name || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                                            <div className="text-xs text-gray-500">Stock: {product.quantity}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                                product.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                product.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                product.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                                }`}>
                                                {product.status === 'APPROVED' ? 'Approuvé' : 
                                                 product.status === 'PENDING' ? 'En attente' : 
                                                 product.status === 'REJECTED' ? 'Refusé' : product.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => toggleFeatured(product.id, !!product.featured)}
                                                className={`text-xs font-bold px-3 py-1 rounded-full border ${product.featured ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                                                title="Mettre en vedette sur l'accueil / catalogue"
                                            >
                                                {product.featured ? '★ En vedette' : 'Mettre en vedette'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex gap-2 justify-end">
                                                <Link href={`/products/${product.id}`} target="_blank" className="text-gray-600 hover:text-gray-900 bg-gray-50 p-1.5 rounded-lg border border-gray-100 transition-colors" title="Aperçu">
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                
                                                {product.status !== 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleModerationAction(product.id, 'approve')}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-lg border border-green-100 transition-colors"
                                                        title="Approuver"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                )}

                                                {product.status !== 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleModerationAction(product.id, 'reject')}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-lg border border-red-100 transition-colors"
                                                        title="Refuser"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-gray-400 hover:text-red-600 bg-gray-50 p-1.5 rounded-lg border border-gray-100 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center mt-4">
                    <div className="flex gap-2">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => router.push(`/admin/products?page=${pagination.page - 1}${search ? `&search=${search}` : ''}`)}
                            className="btn btn-outline disabled:opacity-50"
                        >
                            Précédent
                        </button>
                        <button
                            disabled={pagination.page === pagination.pages}
                            onClick={() => router.push(`/admin/products?page=${pagination.page + 1}${search ? `&search=${search}` : ''}`)}
                            className="btn btn-outline disabled:opacity-50"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function AdminProductsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
            <AdminProductsContent />
        </Suspense>
    )
}
