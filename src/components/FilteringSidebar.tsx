'use client'

import React, { useState, useEffect } from 'react'
import { Filter, ChevronDown, Check, Star } from 'lucide-react'

interface Category {
  id: string
  name: string
  _count: { products: number }
}

interface FilteringSidebarProps {
  onFilterChange: (filters: any) => void
  currentFilters: any
}

export default function FilteringSidebar({ onFilterChange, currentFilters }: FilteringSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({
    categories: true,
    price: true,
    location: true,
    rating: false
  })

  const cities = ['Cotonou', 'Abomey-Calavi', 'Porto-Novo', 'Parakou', 'Ouidah', 'Bohicon']

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const toggleExpand = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleCategoryClick = (id: string) => {
      onFilterChange({ ...currentFilters, categoryId: currentFilters.categoryId === id ? null : id })
  }

  const handleCityClick = (city: string) => {
      onFilterChange({ ...currentFilters, city: currentFilters.city === city ? null : city })
  }

  const handlePriceChange = (min: number | null, max: number | null) => {
      onFilterChange({ ...currentFilters, minPrice: min, maxPrice: max })
  }

  return (
    <aside className="w-full lg:w-72 space-y-8">
      {/* Categories */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <button
          onClick={() => toggleExpand('categories')}
          className="flex items-center justify-between w-full mb-4 group"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary-orange" />
            <span className="font-bold text-gray-900">Catégories</span>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expanded.categories ? 'rotate-180' : ''}`} />
        </button>

        {expanded.categories && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-50 animate-pulse rounded-xl"></div>
              ))
            ) : (
                categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl transition-all ${
                    currentFilters.categoryId === category.id
                      ? 'bg-primary-orange text-white shadow-lg shadow-primary-orange/20'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-sm font-semibold">{category.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    currentFilters.categoryId === category.id ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {category._count.products}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <button
          onClick={() => toggleExpand('location')}
          className="flex items-center justify-between w-full mb-4 group"
        >
          <span className="font-bold text-gray-900">Localisation</span>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expanded.location ? 'rotate-180' : ''}`} />
        </button>

        {expanded.location && (
          <div className="grid grid-cols-2 gap-2">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => handleCityClick(city)}
                className={`flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  currentFilters.city === city
                    ? 'bg-primary-blue text-white border-primary-blue'
                    : 'border-gray-200 text-gray-500 hover:border-primary-blue hover:text-primary-blue'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <button
            onClick={() => toggleExpand('price')}
            className="flex items-center justify-between w-full mb-4 group"
        >
            <span className="font-bold text-gray-900">Budget (FCFA)</span>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expanded.price ? 'rotate-180' : ''}`} />
        </button>

        {expanded.price && (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        placeholder="Min"
                        className="w-full bg-gray-50 border-none rounded-2xl p-3 text-sm font-bold focus:ring-2 focus:ring-primary-orange transition-all"
                        value={currentFilters.minPrice || ''}
                        onChange={(e) => handlePriceChange(Number(e.target.value) || null, currentFilters.maxPrice)}
                    />
                    <div className="w-4 h-0.5 bg-gray-300"></div>
                    <input
                        type="number"
                        placeholder="Max"
                        className="w-full bg-gray-50 border-none rounded-2xl p-3 text-sm font-bold focus:ring-2 focus:ring-primary-orange transition-all"
                        value={currentFilters.maxPrice || ''}
                        onChange={(e) => handlePriceChange(currentFilters.minPrice, Number(e.target.value) || null)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {[5000, 25000, 100000, 500000].map(price => (
                        <button
                            key={price}
                            onClick={() => handlePriceChange(null, price)}
                            className="text-[10px] font-bold px-3 py-1.5 bg-gray-100 rounded-full text-gray-500 hover:bg-primary-orange/10 hover:text-primary-orange transition-all"
                        >
                            {'<'} {price.toLocaleString()}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Ratings */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <button
            onClick={() => toggleExpand('rating')}
            className="flex items-center justify-between w-full mb-4 group"
        >
            <span className="font-bold text-gray-900">Note Vendeur</span>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expanded.rating ? 'rotate-180' : ''}`} />
        </button>

        {expanded.rating && (
            <div className="space-y-2">
                {[4, 3, 2].map(rating => (
                    <button
                        key={rating}
                        className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-xl transition-all group"
                    >
                        <div className="flex text-yellow-400 italic font-black">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 fill-current ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                            ))}
                        </div>
                        <span className="text-xs font-bold text-gray-500">& Plus</span>
                    </button>
                ))}
            </div>
        )}
      </div>
    </aside>
  )
}
