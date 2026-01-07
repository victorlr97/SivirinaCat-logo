"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { CatalogHeader } from "@/components/catalog/catalog-header"
import { ProductGrid } from "@/components/catalog/product-grid"
import { useSearchParams } from "next/navigation"

type Product = {
  id: string
  name: string
  code: string
  category: string | null
  available: boolean
  visivel_catalogo: boolean
  [key: string]: any
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("categoria")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const fetchData = async () => {
      const { data: categoryData } = await supabase
        .from("products")
        .select("category")
        .eq("available", true)
        .eq("visivel_catalogo", true)
        .not("category", "is", null)

      const cats = Array.from(new Set(categoryData?.map((p) => p.category).filter(Boolean))).sort() as string[]
      setCategories(cats)

      let query = supabase
        .from("products")
        .select("*")
        .eq("available", true)
        .eq("visivel_catalogo", true)
        .order("created_at", { ascending: false })

      if (currentCategory) {
        query = query.eq("category", currentCategory)
      }

      const { data } = await query
      setProducts(data || [])
    }

    fetchData()
  }, [currentCategory, supabase])

  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      product.name?.toLowerCase().includes(term) ||
      product.code?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="min-h-screen">
      <CatalogHeader categories={categories} onSearch={setSearchTerm} />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <ProductGrid products={filteredProducts} />
      </main>
    </div>
  )
}
