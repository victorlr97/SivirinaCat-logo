import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function AdminDashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Se não estiver autenticado, redireciona para login
  if (!user) {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-wide mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Dashboard em construção</p>
        </div>
      </main>
    </div>
  )
}
