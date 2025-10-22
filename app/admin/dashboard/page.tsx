import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProductsList } from "@/components/admin/products-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Se não estiver autenticado, redireciona para login
  if (!user) {
    redirect("/admin")
  }

  // Busca todos os produtos (incluindo indisponíveis)
  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-wide mb-2">Produtos</h1>
            <p className="text-muted-foreground">Gerencie o catálogo SIVIRINA</p>
          </div>
          <Button asChild>
            <Link href="/admin/produtos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Link>
          </Button>
        </div>
        <ProductsList products={products || []} />
      </main>
    </div>
  )
}
