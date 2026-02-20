'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, Eye, Heart, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'

interface Product {
  id: string
  name: string
  price: number
  image_urls: string[]
  category: { name: string } | null
  description: string
  seller_id: string
}

const containerVars = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
}


export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await fetch('/api/products?featured=true&limit=4')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products)
        }
      } catch (error) {
        console.error('Error fetching featured products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div className="text-left">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
              Produits Mis en Avant
            </h2>
            <p className="text-gray-500 font-medium max-w-xl text-lg">
              Une sélection exclusive des meilleures boutiques partenaires Luxanda au Bénin.
            </p>
          </div>
          <Link href="/products" className="text-primary-orange font-black flex items-center group text-lg bg-orange-50 px-6 py-3 rounded-2xl hover:bg-primary-orange hover:text-white transition-all shadow-sm">
            Tout explorer
            <Eye className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 h-72 rounded-[40px] mb-6"></div>
                <div className="h-4 bg-gray-100 rounded-full w-2/3 mb-3"></div>
                <div className="h-6 bg-gray-100 rounded-full w-1/3"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <motion.div
            variants={containerVars}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVars}
                className="group relative bg-white border border-gray-100 rounded-[40px] p-3 hover:shadow-2xl hover:shadow-primary-orange/10 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative h-72 overflow-hidden rounded-[32px]">
                  <Image
                    src={product.image_urls[0] || '/images/placeholder-product.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute top-5 left-5">
                    <span className="bg-white/95 backdrop-blur-md text-gray-900 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                      {product.category?.name || 'Exclusive'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-black text-gray-900 line-clamp-1 mb-2 group-hover:text-primary-orange transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-3xl font-black text-primary-orange mb-8 tracking-tighter">
                    {formatPrice(product.price)}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href={`https://wa.me/2290193389564?text=Bonjour%2C%20je%20suis%20intéressé%20par%20${encodeURIComponent(product.name)}%20sur%20Luxanda`}
                      target="_blank"
                      className="flex items-center justify-center p-4 bg-gray-900 text-white rounded-2xl hover:bg-primary-blue transition-all shadow-lg shadow-gray-900/10 hover:shadow-primary-blue/20"
                      title="Contact WhatsApp"
                    >
                      <MessageCircle className="h-6 w-6" />
                    </Link>
                    <Link
                      href={`/products/${product.id}`}
                      className="flex items-center justify-center p-4 bg-primary-orange/5 text-primary-orange rounded-2xl hover:bg-primary-orange hover:text-white transition-all font-black"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-gray-50 rounded-[60px] border-2 border-dashed border-gray-200"
          >
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50">
              <ShoppingBag className="h-10 w-10 text-primary-blue" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Prochainement disponibles</h3>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium italic">Nos vendeurs préparent leurs meilleures offres pour vous. Revenez très bientôt !</p>
            <Link href="/products" className="btn btn-primary px-12 py-4 shadow-xl shadow-primary-orange/20">
              Tout le catalogue
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
