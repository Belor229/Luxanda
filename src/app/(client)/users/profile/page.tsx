'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

interface UserProfile {
    id: string
    email: string
    name: string
    role: string
    profile?: {
        phone?: string
        firstName?: string
        lastName?: string
    }
}

export default function UserProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            const response = await fetch('/api/users/me')
            if (response.ok) {
                const data = await response.json()
                setUser(data)
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    if (loading) return <div className="p-8 text-center">Chargement...</div>

    if (!user) return <div className="p-8 text-center">Erreur de chargement du profil</div>

    return (
        <div className="container-custom py-12">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 space-y-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="h-20 w-20 bg-primary-orange rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <h2 className="font-bold text-gray-900">{user.name}</h2>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {user.role}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <nav className="flex flex-col">
                            <Link href="/users/profile" className="px-4 py-3 bg-orange-50 text-primary-orange font-medium border-l-4 border-primary-orange">
                                Mon Profil
                            </Link>
                            <Link href="/users/orders" className="px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                                Mes Commandes
                            </Link>
                            <Link href="/users/addresses" className="px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                                Adresses
                            </Link>
                            <button onClick={handleLogout} className="px-4 py-3 text-left text-red-600 hover:bg-red-50">
                                Déconnexion
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* content */}
                <div className="flex-1 space-y-6">
                    <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                                <div className="mt-1 p-2 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900">
                                    {user.name}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <div className="mt-1 p-2 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900">
                                    {user.email}
                                </div>
                            </div>
                            {/* Add phone etc if available in profile */}
                        </div>
                    </div>

                    {user.role === 'VENDOR' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Espace Vendeur</h2>
                            <p className="text-gray-600 mb-4">Vous avez un compte vendeur. Accédez à votre tableau de bord pour gérer votre boutique.</p>
                            <Link href="/vendor/dashboard" className="btn btn-primary">
                                Accéder au Dashboard Vendeur
                            </Link>
                        </div>
                    )}

                    {user.role === 'ADMIN' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Administration</h2>
                            <Link href="/admin" className="btn btn-primary bg-purple-600 hover:bg-purple-700">
                                Accéder au Panel Admin
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
