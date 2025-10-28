import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { ClientesList } from "@/components/admin/clientes-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function AdminClientesPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin")
  }

  const { data: clientes } = await supabase.from("clientes").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-wide mb-2">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus clientes SIVIRINA</p>
          </div>
          <Button asChild>
            <Link href="/admin/clientes/novo">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Link>
          </Button>
        </div>
        <ClientesList clientes={clientes || []} />
      </main>
    </div>
  )
}
