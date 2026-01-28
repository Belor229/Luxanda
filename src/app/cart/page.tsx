'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CreditCard } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex items-center py-16">
        <div className="container-custom text-center">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm max-w-lg mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Votre panier est vide</h1>
            <p className="text-gray-600 mb-8 max-w-xs mx-auto">
              Découvrez nos produits et commencez à ajouter des articles à votre panier.
            </p>
            <Link href="/products" className="btn btn-primary inline-flex items-center space-x-2 px-8 py-3">
              <ArrowLeft className="h-5 w-5" />
              <span>Voir la boutique</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Panier ({getItemCount()})</h1>
              <Link href="/products" className="text-primary-blue hover:text-primary-orange flex items-center transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continuer mes achats
              </Link>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 md:gap-6 group transition-all hover:border-primary-orange/20">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image || '/images/placeholder-product.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2 gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 truncate hover:text-primary-orange transition-colors cursor-default">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500">Vendeur: {item.vendorName || 'Luxanda'}</p>
                      </div>
                      <span className="font-bold text-lg text-primary-orange">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-primary-orange transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:text-primary-orange transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-6 border-b border-gray-50">Récapitulatif</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(getTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className="text-green-500 font-medium italic">Calculée à l'étape suivante</span>
                </div>
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-extrabold text-primary-orange">{formatPrice(getTotal())}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full btn btn-primary flex items-center justify-center space-x-3 py-4 shadow-lg shadow-primary-orange/20"
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-lg">Commander</span>
              </Link>

              <p className="mt-6 text-xs text-gray-400 text-center uppercase tracking-wider font-medium">
                Paiement sécurisé par Kkiapay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
