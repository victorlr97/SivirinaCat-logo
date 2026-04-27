import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { ClienteForm } from "@/components/admin/cliente-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: cliente } = await supabase.from("clientes").select("*").eq("id", id).single()

  if (!cliente) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin/clientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-wide mb-2">Editar Cliente</h1>
          <p className="text-muted-foreground">Atualize as informações do cliente</p>
        </div>

        <ClienteForm cliente={cliente} />
      </main>
    </div>
  )
}
