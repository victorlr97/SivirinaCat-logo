"use client"

import { useState, useEffect, useRef } from "react"
import { CatalogHeader } from "@/components/catalog/catalog-header"
import { CategoryFilter } from "@/components/catalog/category-filter"
import { ProductGrid } from "@/components/catalog/product-grid"
import { trackProductListViewed, trackSearchSubmitted } from "@/lib/amplitude"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  product_code?: string
}

interface CatalogClientProps {
  categories: string[]
  products: Product[]
}

export function CatalogClient({ categories, products }: CatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const trackedQueries = useRef<Set<string>>(new Set())

  const filtered = searchQuery.trim()
    ? products.filter((p) => {
        const query = searchQuery.trim().toLowerCase()
        const matchName = p.name?.toLowerCase().includes(query)
        const matchCode = p.product_code?.toLowerCase().includes(query)
        const matchPrice = String(p.price).includes(query) ||
          p.price.toFixed(2).includes(query)
        return matchName || matchCode || matchPrice
      })
    : products

  useEffect(() => {
    trackProductListViewed({
      listName: "Catálogo",
      listSource: "catalog_page",
      productsShown: products.length,
      pageNumber: 1,
      collectionName: "Todas as peças",
    })
  }, [products.length])

  useEffect(() => {
    const query = searchQuery.trim()
    if (!query) return

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)

    searchDebounceRef.current = setTimeout(() => {
      if (trackedQueries.current.has(query)) return
      trackedQueries.current.add(query)

      trackSearchSubmitted({
        searchQuery: query,
        searchContext: "catalog",
        resultsCount: filtered.length,
        noResults: filtered.length === 0,
        isAutocomplete: false,
      })
    }, 800)

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [searchQuery, filtered.length])

  return (
    <>
      <CatalogHeader
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <CategoryFilter
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <ProductGrid products={filtered} searchQuery={searchQuery} />
      </main>
    </>
  )
}
