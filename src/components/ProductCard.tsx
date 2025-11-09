'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, Eye } from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  images: string[]
  vendor_name: string
  vendor_email: string
  is_featured: boolean
  stock_quantity: number
  created_at: string
}

interface ProductCardProps {
  product: Product
  viewMode: 'grid' | 'list'
}

export default function ProductCard({ product, viewMode }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Bonjour, je suis intéressé par ${product.name} sur Luxanda. Pouvez-vous m'en dire plus ?`
    )
    const whatsappUrl = `https://wa.me/2290193389564?text=${message}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  if (viewMode === 'list') {
    return (
      <div className="card group">
        <div className="flex gap-6">
          <div className="relative w-48 h-48 flex-shrink-0">
            <Image
              src={product.images[0] || '/images/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          
          <div className="flex-1 py-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-orange transition-colors">
                {product.name}
              </h3>
              <span className="text-2xl font-bold text-primary-orange">
                {formatPrice(product.price)}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">
              {product.description}
            </p>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-gray-500">
                Par {product.vendor_name}
              </span>
              <span className="text-sm text-gray-500">
                {product.category}
              </span>
              <span className="text-sm text-gray-500">
                Stock: {product.stock_quantity}
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleWhatsAppClick}
                className="btn btn-primary flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Contacter sur WhatsApp
              </button>
              <Link
                href={`/products/${product.id}`}
                className="btn btn-outline flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Voir détails
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card group">
      <div className="relative overflow-hidden">
        <Image
          src={product.images[0] || '/images/placeholder-product.jpg'}
          alt={product.name}
          width={300}
          height={200}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-orange transition-colors">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary-orange">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleWhatsAppClick}
            className="w-full btn btn-primary text-sm py-2 flex items-center justify-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Contacter sur WhatsApp</span>
          </button>
          <Link
            href={`/products/${product.id}`}
            className="w-full btn btn-outline text-sm py-2"
          >
            Voir détails
          </Link>
        </div>
      </div>
    </div>
  )
}
