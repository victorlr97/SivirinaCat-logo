import { createServerClient } from "@/lib/supabase/server"
import { CatalogHeader } from "@/components/catalog/catalog-header"
import { CategoryFilter } from "@/components/catalog/category-filter"
import { ProductGrid } from "@/components/catalog/product-grid"

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const supabase = await createServerClient()
  const params = await searchParams

  const { data: categoryData } = await supabase
    .from("products")
    .select("category")
    .eq("available", true)
    .eq("visivel_catalogo", true)
    .not("category", "is", null)

  const categories = Array.from(new Set(categoryData?.map((p) => p.category).filter(Boolean))).sort() as string[]

  let query = supabase
    .from("products")
    .select("*")
    .eq("available", true)
    .eq("visivel_catalogo", true)
    .order("created_at", { ascending: false })

  if (params.categoria) {
    query = query.eq("category", params.categoria)
  }

  const { data: products } = await query

  return (
    <div className="min-h-screen">
      <CatalogHeader />
      <CategoryFilter categories={categories} />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <ProductGrid products={products || []} />
      </main>
    </div>
  )
}
