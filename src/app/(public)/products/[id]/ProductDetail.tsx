'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, ShoppingCart, ArrowLeft, ShieldCheck, Truck, AlertTriangle } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'

interface Product {
    id: string
    vendorId: string
    name: string
    description: string
    price: number
    category: { name: string }
    vendor: { storeName: string, userId: string }
    images: string[]
    stock_quantity: number
}

export default function ProductDetail({ id }: { id: string }) {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportForm, setReportForm] = useState({ motif: '', description: '' })
    const [submittingReport, setSubmittingReport] = useState(false)
    const addItem = useCartStore((state: any) => state.addItem)

    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await fetch(`/api/products/${id}`)
                const data = await response.json()
                if (response.ok) {
                    setProduct(data.product)
                }
            } catch (error) {
                console.error('Error fetching product:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [id])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(price)
    }

    const handleReport = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmittingReport(true)
        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: id,
                    vendorId: product?.vendorId,
                    motif: reportForm.motif,
                    description: reportForm.description
                })
            })
            if (res.ok) {
                alert('Merci pour votre signalement. Notre équipe va examiner ce produit.')
                setShowReportModal(false)
                setReportForm({ motif: '', description: '' })
            }
        } catch (error) {
            console.error('Report error:', error)
        } finally {
            setSubmittingReport(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 animate-pulse">
                <div className="container-custom">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="w-full lg:w-1/2 h-96 bg-gray-200 rounded-2xl"></div>
                        <div className="flex-1 space-y-6 pt-8">
                            <div className="h-8 bg-gray-200 w-3/4 rounded"></div>
                            <div className="h-6 bg-gray-200 w-1/4 rounded"></div>
                            <div className="h-24 bg-gray-200 w-full rounded"></div>
                            <div className="h-12 bg-gray-200 w-1/2 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
                    <Link href="/products" className="btn btn-primary">Retour aux produits</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom">
                <Link href="/products" className="inline-flex items-center text-gray-600 hover:text-primary-orange mb-8 transition-colors">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Retour à la boutique
                </Link>

                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="flex flex-col lg:flex-row">
                        {/* Image Gallery */}
                        <div className="w-full lg:w-1/2 p-4 lg:p-8">
                            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 group">
                                <Image
                                    src={product.images[0] || '/images/placeholder-product.jpg'}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 p-8 lg:p-12">
                            <div className="mb-6">
                                <span className="inline-block px-3 py-1 bg-primary-orange/10 text-primary-orange rounded-full text-sm font-semibold mb-4">
                                    {product.category?.name}
                                </span>
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                <p className="text-gray-500 font-medium">Boutique : {product.vendor?.storeName}</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-extrabold text-primary-orange">
                                    {formatPrice(product.price)}
                                </span>
                            </div>

                            <div className="prose prose-sm text-gray-600 mb-10 max-w-none">
                                <p className="whitespace-pre-line">{product.description}</p>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                <button
                                    onClick={() => addItem(product)}
                                    className="btn btn-primary flex items-center justify-center space-x-3 py-4 shadow-lg shadow-primary-orange/20"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    <span className="text-lg">Ajouter au panier</span>
                                </button>
                                <Link
                                    href={`https://wa.me/2290141757559?text=${encodeURIComponent(`Bonjour, j'aimerais acheter ${product.name}`)}`}
                                    target="_blank"
                                    className="btn bg-green-500 hover:bg-green-600 text-white flex items-center justify-center space-x-3 py-4"
                                >
                                    <MessageCircle className="h-5 w-5 font-bold" />
                                    <span className="text-lg">Acheter via WhatsApp</span>
                                </Link>
                            </div>

                            {/* Report Button */}
                            <div className="flex justify-end mb-6">
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="flex items-center text-gray-400 hover:text-red-500 text-sm transition-colors"
                                >
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    Signaler ce produit
                                </button>
                            </div>

                            {/* Features/Trust */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-gray-100">
                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Confiance Garantie</h4>
                                        <p className="text-xs text-gray-500">Vendeurs vérifiés par l'équipe Luxanda</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <Truck className="h-6 w-6 text-primary-orange" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Livraison Rapide</h4>
                                        <p className="text-xs text-gray-500">Coordination directe avec le vendeur</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Modal */}
                {showReportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Signaler ce produit
                            </h2>
                            <form onSubmit={handleReport} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                                    <select
                                        required
                                        className="w-full border rounded-lg p-2"
                                        value={reportForm.motif}
                                        onChange={e => setReportForm({ ...reportForm, motif: e.target.value })}
                                    >
                                        <option value="">Sélectionnez un motif...</option>
                                        <option value="Contrefaçon">Contrefaçon</option>
                                        <option value="Prix abusif">Prix abusif</option>
                                        <option value="Arnaque / Fraude">Arnaque / Fraude</option>
                                        <option value="Produit interdit">Produit interdit</option>
                                        <option value="Contenu inapproprié">Contenu inapproprié</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Facultatif)</label>
                                    <textarea
                                        className="w-full border rounded-lg p-2 min-h-[100px]"
                                        value={reportForm.description}
                                        onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
                                        placeholder="Précisez votre signalement..."
                                    />
                                </div>
                                <div className="flex gap-3 justify-end pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowReportModal(false)}
                                        className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingReport}
                                        className="btn btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {submittingReport ? 'Envoi...' : 'Signaler'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
