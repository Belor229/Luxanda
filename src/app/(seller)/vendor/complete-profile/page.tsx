'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Phone, MapPin, FileText, User, ArrowRight, CheckCircle, Image as ImageIcon } from 'lucide-react'

const CITIES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Djougou', 'Bohicon', 'Natitingou', 'Lokossa', 'Ouidah', 'Kandi', 'Autre']
const CATEGORIES = ['Mode & Vêtements', 'Électronique', 'Alimentaire', 'Beauté & Cosmétiques', 'Maison & Décoration', 'Sport & Loisirs', 'Automobile', 'Services', 'Autre']

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
    city: '',
    category: '',
    storeName: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!formData.fullName.trim()) {
      setError('Le nom complet est requis')
      return
    }
    if (!formData.whatsapp.trim()) {
      setError('Le numéro WhatsApp est obligatoire')
      return
    }
    if (!formData.city) {
      setError('Veuillez sélectionner votre ville')
      return
    }
    if (!formData.storeName.trim()) {
      setError('Le nom de boutique est obligatoire')
      return
    }
    if (formData.description.trim().length < 20) {
      setError('La description de votre boutique doit contenir au moins 20 caractères')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/vendor/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/vendor/dashboard')
          router.refresh()
        }, 2000)
      } else {
        setError(data.error || 'Erreur lors de la soumission du profil')
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Profil soumis avec succès !</h2>
          <p className="text-gray-500 font-medium mb-6">
            Votre profil vendeur est en cours de validation par notre équipe. Vous recevrez une réponse sous 24-48 heures.
          </p>
          <div className="animate-spin h-6 w-6 border-3 border-primary-orange border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Store className="h-8 w-8 text-primary-orange" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
            Complétez votre profil vendeur
          </h1>
          <p className="text-gray-500 font-medium max-w-md mx-auto">
            Remplissez ces informations pour activer votre boutique sur Luxanda. Un administrateur validera votre demande sous 24-48h.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-bold text-gray-700 mb-2">
                Nom complet *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder="Votre nom complet"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-bold text-gray-700 mb-2">
                Numéro WhatsApp *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  required
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder="+229 01 XX XX XX XX"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Les clients vous contacteront via ce numéro</p>
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-bold text-gray-700 mb-2">
                Ville *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                >
                  <option value="">Sélectionner votre ville</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Store Name */}
            <div>
              <label htmlFor="storeName" className="block text-sm font-bold text-gray-700 mb-2">
                Nom de la boutique *
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="storeName"
                  name="storeName"
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  placeholder="Ma Boutique Luxanda"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-2">
                Catégorie principale
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              >
                <option value="">Sélectionner une catégorie</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
                Description de la boutique *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none"
                  placeholder="Décrivez votre activité, vos produits et ce qui rend votre boutique unique (min. 20 caractères)..."
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">{formData.description.length}/20 caractères minimum</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-orange text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  Soumettre mon profil
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Après soumission, un administrateur Luxanda examinera votre profil sous 24-48 heures.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
