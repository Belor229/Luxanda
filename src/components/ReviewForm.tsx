'use client'

import React, { useState } from 'react'
import { Star, Send, Loader2, CheckCircle2 } from 'lucide-react'

interface ReviewFormProps {
  productId: string
  onSuccess?: () => void
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Veuillez sélectionner une note')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title, comment })
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
        if (onSuccess) onSuccess()
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 rounded-[2rem] p-8 text-center border border-green-100 animate-in fade-in zoom-in duration-300">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Merci pour votre avis !</h3>
        <p className="text-green-700 font-medium">Votre retour aide la communauté Luxanda à mieux choisir.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-bold text-green-600 hover:underline"
        >
          Modifier mon avis
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[3rem] p-8 lg:p-10 border border-gray-100 shadow-xl shadow-gray-200/50">
      <h3 className="text-2xl font-black text-gray-900 mb-6">Partagez votre expérience</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Note Globale</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform active:scale-90"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  className={`h-10 w-10 transition-colors ${
                    (hover || rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Titre (optionnel)</label>
            <input
              type="text"
              placeholder="Ex: Excellent produit !"
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-orange transition-all placeholder:text-gray-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Votre commentaire</label>
            <textarea
              rows={4}
              placeholder="Dites-nous ce que vous avez aimé ou amélioré..."
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary-orange transition-all placeholder:text-gray-400"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <span className="font-black italic">ENVOYER MON AVIS</span>
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
