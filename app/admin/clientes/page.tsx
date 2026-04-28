export const dynamic = 'force-dynamic'

import { getClientes } from "@/lib/firebase/db-server"
import { AdminHeader } from "@/components/admin/admin-header"
import { ClientesList } from "@/components/admin/clientes-list"

export default async function AdminClientesPage() {
  const clientes = await getClientes()

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-wide mb-2">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus clientes SIVIRINA</p>
          </div>
        </div>
        <ClientesList clientes={clientes || []} />
      </main>
    </div>
  )
}
