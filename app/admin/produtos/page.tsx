export const dynamic = 'force-dynamic'

import { getProducts } from "@/lib/firebase/db-server"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProductsList } from "@/components/admin/products-list"

export default async function AdminProductsPage() {
  const products = await getProducts()

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
