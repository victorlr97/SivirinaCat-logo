import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { ProductDetails } from "@/components/catalog/product-details"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: product } = await supabase.from("products").select("*").eq("id", id).eq("available", true).single()

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12 md:py-16">
        <ProductDetails product={product} />
      </main>
    </div>
  )
}
