"use client"

import { useState, useMemo } from "react"
import { CatalogHeader } from "./catalog-header"
import { ProductGrid } from "./product-grid"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  product_code?: string
  category?: string
}

interface CatalogWrapperProps {
  categories: string[]
  initialProducts: Product[]
}

export function CatalogWrapper({ categories, initialProducts }: CatalogWrapperProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return initialProducts
    }

    const lowerSearch = searchTerm.toLowerCase()
    return initialProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerSearch) ||
        product.product_code?.toLowerCase().includes(lowerSearch) ||
        product.category?.toLowerCase().includes(lowerSearch),
    )
  }, [searchTerm, initialProducts])

  return (
    <>
      <CatalogHeader categories={categories} onSearch={setSearchTerm} />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <ProductGrid products={filteredProducts} />
      </main>
    </>
  )
}
