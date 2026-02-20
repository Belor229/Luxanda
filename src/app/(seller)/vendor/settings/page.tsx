'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function VendorSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        storeName: '',
        description: '',
        phone: '',
        logo: ''
    })

    useEffect(() => {
        fetchVendorProfile()
    }, [])

    const fetchVendorProfile = async () => {
        try {
            const response = await fetch('/api/vendor')
            if (response.ok) {
                const data = await response.json()
                setFormData({
                    storeName: data.storeName || '',
                    description: data.description || '',
                    phone: data.phone || '', // Check if API returns this
                    logo: data.logo || ''
                })
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            // We might need a PATCH endpoint for vendor profile update
            // For now reusing POST or creating a new one?
            // Let's assume POST to /api/vendor handles update if exists, or create new.
            // Actually my previous implementation of POST /api/vendor checks if exists and errors if so.
            // I should update /api/vendor/route.ts to handle PATCH or PUT.

            const response = await fetch('/api/vendor', {
                method: 'PATCH', // Need to implement this in route
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                alert('Profil mis à jour avec succès')
                router.refresh()
            } else {
                alert('Erreur lors de la mise à jour')
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('Erreur lors de la mise à jour')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Chargement...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Paramètres de la boutique</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique</label>
                        <input
                            type="text"
                            name="storeName"
                            required
                            value={formData.storeName}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-orange focus:ring-primary-orange sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-orange focus:ring-primary-orange sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                        <input
                            type="text"
                            name="logo"
                            value={formData.logo}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-orange focus:ring-primary-orange sm:text-sm p-2 border"
                        />
                        {formData.logo && (
                            <div className="mt-2">
                                <Image src={formData.logo} alt="Logo preview" width={100} height={100} className="rounded-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange disabled:opacity-50"
                        >
                            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
