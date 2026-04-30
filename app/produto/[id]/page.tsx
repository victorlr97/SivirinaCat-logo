export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import { getProduct } from "@/lib/firebase/db-server"
import { CatalogHeader } from "@/components/catalog/catalog-header"
import { ProductDetails } from "@/components/catalog/product-details"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product || !product.available) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <CatalogHeader />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <ProductDetails product={product} />
      </main>
    </div>
  )
}
