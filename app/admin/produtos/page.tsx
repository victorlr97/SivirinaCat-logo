import { createServerClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProductsList } from "@/components/admin/products-list"

export default async function AdminProductsPage() {
  const supabase = await createServerClient()

  // Busca todos os produtos (incluindo indisponíveis)
  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-wide mb-2">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo SIVIRINA</p>
        </div>
        <ProductsList products={products || []} />
      </main>
    </div>
  )
}
