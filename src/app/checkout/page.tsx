'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  Truck,
  ChevronRight,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Bénin',
    notes: '',
    paymentMethod: 'kkiapay'
  })

  useEffect(() => {
    setMounted(true)
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      }))
    }
  }, [])

  if (!mounted) return null
  if (items.length === 0 && step < 3) {
    router.push('/cart')
    return null
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmitOrder = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Veuillez vous connecter pour finaliser votre commande')
        router.push('/login?redirect=/checkout')
        return
      }

      // First step: Create address or get one (Mock for now)
      // Real flow would call /api/users/addresses

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          total: getTotal(),
          addressId: 'temp-address-id', // Simplified for demo
          paymentMethod: formData.paymentMethod,
          notes: formData.notes
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStep(3)
        clearCart()
      } else {
        setError(data.error || 'Erreur lors de la validation de la commande')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-6xl">
        {/* Progress Tracker */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold border-2 transition-all ${step >= i ? 'bg-primary-orange border-primary-orange text-white' : 'border-gray-300 text-gray-400 bg-white'
                }`}>
                {step > i ? <CheckCircle className="h-6 w-6" /> : i}
              </div>
              {i < 3 && (
                <div className={`w-16 h-1 mx-2 rounded-full ${step > i ? 'bg-primary-orange' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPin className="mr-3 text-primary-orange" />
                  Informations de livraison
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input name="firstName" value={formData.firstName} onChange={handleInputChange} className="input-checkout" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} className="input-checkout" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse complète</label>
                    <input name="address" value={formData.address} onChange={handleInputChange} placeholder="Quartier, Rue, Maison..." className="input-checkout" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                    <input name="city" value={formData.city} onChange={handleInputChange} className="input-checkout" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} className="input-checkout" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Truck className="mr-3 text-primary-orange" />
                  Méthode de livraison
                </h2>
                <div className="p-4 border-2 border-primary-orange bg-orange-50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white p-3 rounded-full mr-4">
                      <Truck className="text-primary-orange" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Standard</p>
                      <p className="text-sm text-gray-500">Livraison sous 24h-48h</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary-orange">Gratuit</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <OrderSummary items={items} total={getTotal()} formatPrice={formatPrice} />
              <button
                onClick={() => setStep(2)}
                className="w-full btn btn-primary py-4 text-lg font-bold shadow-lg shadow-primary-orange/20 flex items-center justify-center group"
              >
                Passer au paiement
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-10 rounded-3xl shadow-sm text-center">
              <CreditCard className="h-16 w-16 text-primary-orange mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Paiement Sécurisé</h2>
              <p className="text-gray-600 mb-10 max-w-md mx-auto">
                Votre commande sera finalisée via **Kkiapay**.
                Vous pourrez payer par Mobile Money (MTN, Moov) ou Carte bancaire.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
                <div className="p-6 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-primary-orange transition-all cursor-pointer">
                  <p className="font-bold text-gray-900">Kkiapay</p>
                  <p className="text-sm text-gray-500">Mobile Money & Cartes</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border-2 border-transparent opacity-50 cursor-not-allowed">
                  <p className="font-bold text-gray-900">Paiement à la livraison</p>
                  <p className="text-sm text-gray-500">Bientôt disponible</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center justify-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-outline py-4 px-8"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Retour
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className="btn btn-primary py-4 px-12 text-lg font-bold min-w-[240px]"
                >
                  {loading ? <Loader2 className="animate-spin h-6 w-6 mx-auto" /> : `Payer ${formatPrice(getTotal())}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Merci pour votre commande !</h1>
            <p className="text-xl text-gray-600 mb-12">
              Votre commande a été reçue. Un vendeur prendra bientôt contact avec vous pour coordonner la livraison.
            </p>
            <div className="space-y-4">
              <Link href="/" className="btn btn-primary px-10 py-4 block sm:inline-block">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderSummary({ items, total, formatPrice }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Votre Commande</h3>
      <div className="space-y-4 mb-8">
        {items.map((item: any) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-600 flex-1 truncate mr-4">{item.quantity}x {item.name}</span>
            <span className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="pt-6 border-t border-gray-100 space-y-4">
        <div className="flex justify-between text-gray-600">
          <span>Sous-total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-2xl font-extrabold text-primary-orange">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
