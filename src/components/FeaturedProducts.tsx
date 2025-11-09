'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, Eye, Heart } from 'lucide-react'

const featuredProducts: any[] = []

export default function FeaturedProducts() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Produits mis en avant
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-orange to-primary-blue mx-auto rounded-full"></div>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="card group">
                <div className="relative overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-primary-orange text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {product.category}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                      <button className="p-2 bg-white rounded-full hover:bg-primary-orange hover:text-white transition-colors">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-white rounded-full hover:bg-primary-orange hover:text-white transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary-orange">
                      {product.price}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={`https://wa.me/2290193389564?text=Bonjour%2C%20je%20suis%20intéressé%20par%20${encodeURIComponent(product.name)}%20sur%20Luxanda`}
                      target="_blank"
                      rel="noopener"
                      className="w-full btn btn-outline text-sm py-2 flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Contacter sur WhatsApp</span>
                    </Link>
                    <Link
                      href="/products"
                      className="w-full btn btn-secondary text-sm py-2"
                    >
                      Voir la boutique
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit en vedette</h3>
            <p className="text-gray-600 mb-6">Les vendeurs ajouteront bientôt leurs produits mis en avant.</p>
            <Link href="/products" className="btn btn-primary">
              Découvrir tous les produits
            </Link>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/products" className="btn btn-primary text-lg px-8 py-3">
            Voir tous les produits
          </Link>
        </div>
      </div>
    </section>
  )
}
