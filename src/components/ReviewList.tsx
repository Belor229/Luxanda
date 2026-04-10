'use client'

import React, { useState, useEffect } from 'react'
import { Star, User } from 'lucide-react'
import Image from 'next/image'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  createdAt: string
  user: {
    name: string | null
    profile: { avatar: string | null } | null
  }
}

export default function ReviewList({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch(`/api/products/${productId}/reviews`)
        if (response.ok) {
          const data = await response.json()
          setReviews(data)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [productId])

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
    : 0

  if (loading) return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-100 rounded-full w-48"></div>
      <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-50 rounded-3xl"></div>
          ))}
      </div>
  </div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Avis Clients</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-yellow-400 italic">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 fill-current ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-500">
              {averageRating.toFixed(1)} sur 5 ({reviews.length} avis)
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-hover hover:border-primary-orange/20">
              <div className="flex items-start gap-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {review.user.profile?.avatar ? (
                    <Image
                      src={review.user.profile.avatar}
                      alt={review.user.name || 'User'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900">{review.user.name || 'Utilisateur anonyme'}</span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex text-yellow-400 italic mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 fill-current ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  {review.title && <h4 className="font-bold text-gray-900 mb-1">{review.title}</h4>}
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-gray-500 font-bold">Soyez le premier à donner votre avis !</p>
          </div>
        )}
      </div>
    </div>
  )
}
