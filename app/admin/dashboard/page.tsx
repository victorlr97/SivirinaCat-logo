import { getDashboardData } from "@/lib/firebase/db-server"
import { AdminHeader } from "@/components/admin/admin-header"
import { DashboardStats } from "@/components/admin/dashboard-stats"

export default async function AdminDashboardPage() {
  const dashData = await getDashboardData()

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-wide mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do negócio</p>
        </div>
        <DashboardStats data={dashData} />
      </main>
    </div>
  )
}
