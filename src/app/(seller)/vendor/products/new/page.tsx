'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function NewProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [images, setImages] = useState<string[]>([])

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: 'uuid-placeholder', // TODO: Fetch categories
        quantity: '1',
        status: 'PENDING'
    })

    // Mock category data for now
    const categories = [
        { id: 'uuid-placeholder', name: 'Général' },
        // Add more or fetch from API
    ]

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleImageAdd = () => {
        // Logic to handle image upload would go here.
        // For MVP without storage bucket setup, we might ask for URLs or just a placeholder.
        const url = prompt("Entrez l'URL de l'image (Pour le test):")
        if (url) {
            setImages([...images, url])
        }
    }

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    images: images
                }),
            })

            if (response.ok) {
                router.push('/vendor/products')
                router.refresh()
            } else {
                const error = await response.json()
                alert(error.error || 'Erreur lors de la création')
            }
        } catch (error) {
            console.error('Error creating product:', error)
            alert('Erreur lors de la création')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/vendor/products" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Ajouter un produit</h1>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Images du produit</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {images.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                    <Image src={url} alt={`Product ${index}`} fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4 text-red-500" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleImageAdd}
                                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-primary-orange hover:bg-orange-50 transition-colors"
                            >
                                <Upload className="h-6 w-6 text-gray-400" />
                                <span className="text-xs text-gray-500 mt-1">Ajouter URL</span>
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Pour la démo, utilisez des URLs d'images externes.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-orange focus:ring-primary-orange sm:text-sm p-2 border"
                                placeholder="Ex: Robe de soirée élégante"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-orange focus:ring-primary-orange sm:text-sm p-2 border"
                                placeholder="Décrivez votre produit..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-orange focus:ring-primary-orange sm:text-sm p-2 border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                            <input
                                type="number"
                                name="quantity"
                                required
                                min="0"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-orange focus:ring-primary-orange sm:text-sm p-2 border"
                            />
                        </div>

                        {/* Category Placeholder for now */}
                        <div className="col-span-2 hidden">
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-orange focus:ring-primary-orange sm:text-sm"
                            >
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange disabled:opacity-50"
                        >
                            {loading ? 'Création...' : 'Créer le produit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
