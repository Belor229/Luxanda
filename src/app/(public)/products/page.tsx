'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard, { Product } from '@/components/ProductCard'
import { Grid, List, Search } from 'lucide-react'

import { Suspense } from 'react'

import FilteringSidebar from '@/components/FilteringSidebar'

function ProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState({
      categoryId: null,
      city: null,
      minPrice: null,
      maxPrice: null
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12, // Reduced to 12 as per CDC
    total: 0,
    pages: 0
  })

  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    fetchProducts()
  }, [pagination.page, searchQuery, filters])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            })

            if (searchQuery) params.append('search', searchQuery)
            if (filters.categoryId) params.append('categoryId', filters.categoryId)
            if (filters.city) params.append('city', filters.city)
            if (filters.minPrice !== null) params.append('minPrice', String(filters.minPrice))
            if (filters.maxPrice !== null) params.append('maxPrice', String(filters.maxPrice))

            const response = await fetch(`/api/products?${params}`)
            const data = await response.json()

      if (response.ok) {
        setProducts(data.products)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching products:', data.error)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilterChange = (newFilters: any) => {
      setFilters(newFilters)
      setPagination(prev => ({ ...prev, page: 1 }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              {searchQuery ? `Résultats : "${searchQuery}"` : 'Marketplace'}
            </h1>
            <p className="text-lg text-gray-500 font-medium">
              Découvrez les meilleurs produits du Bénin, sélectionnés pour leur qualité.
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <FilteringSidebar 
            currentFilters={filters}
            onFilterChange={handleFilterChange}
          />

          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 pl-2">
                <span className="text-sm font-bold text-gray-900 bg-primary-orange/10 text-primary-orange px-4 py-2 rounded-full">
                  {pagination.total} produit{pagination.total > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-primary-orange text-white shadow-lg shadow-primary-orange/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-primary-orange text-white shadow-lg shadow-primary-orange/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                    <div className="h-64 bg-gray-100"></div>
                    <div className="p-8 space-y-4">
                      <div className="h-4 bg-gray-100 rounded-full w-1/4"></div>
                      <div className="h-8 bg-gray-100 rounded-2xl w-3/4"></div>
                      <div className="h-4 bg-gray-100 rounded-full w-full"></div>
                      <div className="h-12 bg-gray-100 rounded-2xl w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-8 ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1'
                }`}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] border border-dashed border-gray-200 py-24 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-6 text-gray-300">
                  <Search className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-500 font-medium">
                  Essayez de modifier vos filtres ou votre recherche
                </p>
                <button 
                    onClick={() => handleFilterChange({ categoryId: null, city: null, minPrice: null, maxPrice: null })}
                    className="mt-8 text-primary-orange font-bold hover:underline"
                >
                    Réinitialiser tous les filtres
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-16 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-6 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600 hover:border-primary-orange hover:text-primary-orange disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Précédent
                  </button>

                  <div className="flex items-center gap-2">
                    {[...Array(pagination.pages)].map((_, i) => {
                      const page = i + 1
                      const isCurrentPage = page === pagination.page
                      const isNearCurrent = Math.abs(page - pagination.page) <= 1
                      const isFirstOrLast = page === 1 || page === pagination.pages

                      if (!isNearCurrent && !isFirstOrLast && pagination.pages > 5) {
                        return i === 1 || i === pagination.pages - 2 ? (
                          <span key={page} className="px-2 text-gray-400 font-black">...</span>
                        ) : null
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black transition-all ${isCurrentPage
                            ? 'bg-primary-orange text-white shadow-lg shadow-primary-orange/20 scale-110'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-6 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600 hover:border-primary-orange hover:text-primary-orange disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Chargement des produits...</div>}>
            <ProductsList />
        </Suspense>
    )
}