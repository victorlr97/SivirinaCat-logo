"use client"

import { useState } from "react"
import { CatalogHeader } from "@/components/catalog/catalog-header"
import { CategoryFilter } from "@/components/catalog/category-filter"
import { ProductGrid } from "@/components/catalog/product-grid"

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
