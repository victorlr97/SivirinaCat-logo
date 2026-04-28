import { getVendas } from "@/lib/firebase/db-server"
import { AdminHeader } from "@/components/admin/admin-header"
import { VendasList } from "@/components/admin/vendas-list"

export default async function VendasPage() {
  const vendas = await getVendas()

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-wide mb-2">Vendas</h1>
          <p className="text-muted-foreground">Gerencie as vendas realizadas</p>
        </div>
        <VendasList vendas={vendas || []} />
      </main>
    </div>
  )
}
