'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBag,
  MapPin,
  Truck,
  ChevronRight,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Info
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
    notes: ''
  })

  useEffect(() => {
    setMounted(true)
    const fetchSession = async () => {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setFormData(prev => ({
            ...prev,
            firstName: profile.full_name?.split(' ')[0] || '',
            lastName: profile.full_name?.split(' ').slice(1).join(' ') || '',
            email: session.user.email || '',
            phone: profile.phone || ''
          }))
        }
      }
    }
    fetchSession()
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
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('Veuillez vous connecter pour finaliser votre commande')
        router.push('/login?redirect=/checkout')
        return
      }

      // In a real app, you'd handle multiple sellers. 
      // For Luxanda, we assume orders are grouped by seller or handled as one transaction in the service.
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total_amount: getTotal(),
          shipping_address: `${formData.address}, ${formData.city}, ${formData.country}`,
          phone_contact: formData.phone,
          seller_id: items[0].sellerId, // Use first item's seller for now

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
            <div key={i} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold border-2 transition-all ${step >= i ? 'bg-primary-orange border-primary-orange text-white' : 'border-gray-200 text-gray-400 bg-white'
                }`}>
                {step > i ? <CheckCircle className="h-6 w-6" /> : i}
              </div>
              {i < 3 && (
                <div className={`w-16 h-1 mx-2 rounded-full ${step > i ? 'bg-primary-orange' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPin className="mr-3 text-primary-orange" />
                  Informations de livraison
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Prénom</label>
                    <input name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom</label>
                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Adresse complète</label>
                    <input name="address" value={formData.address} onChange={handleInputChange} placeholder="Quartier, Rue, Maison..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ville</label>
                    <input name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone (WhatsApp)</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+229 ..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Truck className="mr-3 text-primary-orange" />
                  Méthode de livraison
                </h2>
                <div className="p-5 border-2 border-primary-orange bg-orange-50/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white p-3 rounded-xl shadow-sm mr-4">
                      <Clock className="text-primary-orange h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Livraison Express</p>
                      <p className="text-sm text-gray-500">Sous 24h à 48h ouvrés</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs uppercase">Payé à réception</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <OrderSummary items={items} total={getTotal()} formatPrice={formatPrice} />
              <button
                onClick={() => setStep(2)}
                className="w-full btn btn-primary py-4 text-lg font-bold shadow-lg shadow-primary-orange/20 flex items-center justify-center group"
              >
                Confirmer la commande
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="h-10 w-10 text-primary-orange" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Paiement à la livraison</h2>
              <p className="text-gray-600 mb-8">
                Chez Luxanda, vous ne payez qu'une fois votre produit reçu et vérifié.
                <br /><br />
                <span className="font-bold text-gray-900">Total à payer : {formatPrice(getTotal())}</span>
              </p>

              <div className="bg-blue-50 p-4 rounded-2xl flex items-start text-left mb-8">
                <Info className="text-blue-600 h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  En cliquant sur "Finaliser", vous vous engagez à réceptionner la commande.
                  Un agent ou le vendeur vous contactera sur votre numéro WhatsApp pour les détails de la remise.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center justify-center text-sm font-bold">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className="w-full btn btn-primary py-4 text-lg font-bold shadow-lg shadow-primary-orange/20"
                >
                  {loading ? <Loader2 className="animate-spin h-6 w-6 mx-auto" /> : `Finaliser ma commande`}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Modifier mes informations
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
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Commande reçue !</h1>
            <p className="text-xl text-gray-600 mb-12">
              Votre commande a été transmise avec succès. Le vendeur vous contactera très prochainement au <span className="font-bold text-gray-900">{formData.phone}</span>.
            </p>
            <div className="space-y-4">
              <Link href="/products" className="btn btn-primary px-10 py-4 block sm:inline-block">
                Continuer mes achats
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
      <h3 className="text-xl font-bold text-gray-900 mb-6">Votre Panier</h3>
      <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2">
        {items.map((item: any) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-600 flex-1 truncate mr-4"><span className="font-bold text-gray-400">{item.quantity}x</span> {item.name}</span>
            <span className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="pt-6 border-t border-gray-100 space-y-4">
        <div className="flex justify-between text-gray-500 font-medium">
          <span>Sous-total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-gray-500 font-medium">
          <span>Frais de livraison</span>
          <span className="text-primary-orange font-bold">À convenir avec le vendeur</span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-gray-900">Total à payer</span>
          <span className="text-2xl font-black text-primary-orange">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
