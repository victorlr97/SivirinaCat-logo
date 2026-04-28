import { getProductsForCatalog } from "@/lib/firebase/db-server"
import { CatalogClient } from "@/components/catalog/catalog-client"

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const params = await searchParams
  const allProducts = await getProductsForCatalog()

  const categories = Array.from(
    new Set(allProducts.map((p) => p.category).filter(Boolean))
  ).sort() as string[]

  const products = params.categoria
    ? allProducts.filter((p) => p.category === params.categoria)
    : allProducts

  return (
    <div className="min-h-screen">
      <CatalogClient categories={categories} products={products} />
    </div>
  )
}
