import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { DashboardStats } from "@/components/admin/dashboard-stats"

export default async function AdminDashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin")
  }

  // Datas para filtros
  const now = new Date()
  const inicioMesAtual = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const fimMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

  // Queries paralelas
  const [
    vendasMesResult,
    vendasMesAnteriorResult,
    totalClientesResult,
    clientesMesResult,
    clientesMesAnteriorResult,
    produtosResult,
    vendasRecentesResult,
    vendasPendentesResult,
    vendasCanceladasMesResult,
  ] = await Promise.all([
    // Vendas do mês atual
    supabase
      .from("vendas")
      .select("id, total")
      .gte("data_venda", inicioMesAtual),

    // Vendas do mês anterior
    supabase
      .from("vendas")
      .select("id, total")
      .gte("data_venda", inicioMesAnterior)
      .lte("data_venda", fimMesAnterior),

    // Total de clientes
    supabase.from("clientes").select("id", { count: "exact", head: true }),

    // Novos clientes este mês
    supabase
      .from("clientes")
      .select("id", { count: "exact", head: true })
      .gte("created_at", inicioMesAtual),

    // Novos clientes mês anterior
    supabase
      .from("clientes")
      .select("id", { count: "exact", head: true })
      .gte("created_at", inicioMesAnterior)
      .lte("created_at", fimMesAnterior),

    // Produtos
    supabase.from("products").select("id, name, quantidade_estoque, available"),

    // Vendas recentes com cliente
    supabase
      .from("vendas")
      .select("id, total, data_venda, forma_pagamento, status, clientes(nome)")
      .order("data_venda", { ascending: false })
      .limit(5),

    // Vendas pendentes
    supabase
      .from("vendas")
      .select("id", { count: "exact", head: true })
      .eq("status", "pendente"),

    // Vendas canceladas/devolução este mês
    supabase
      .from("vendas")
      .select("id", { count: "exact", head: true })
      .in("status", ["cancelada", "devolucao"])
      .gte("data_venda", inicioMesAtual),
  ])

  // Processar dados
  const vendasMes = vendasMesResult.data ?? []
  const vendasMesAnterior = vendasMesAnteriorResult.data ?? []
  const produtos = produtosResult.data ?? []

  const receitaMes = vendasMes.reduce((acc, v) => acc + Number(v.total), 0)
  const receitaMesAnterior = vendasMesAnterior.reduce((acc, v) => acc + Number(v.total), 0)

  const produtosSemEstoque = produtos.filter((p) => p.quantidade_estoque === 0).length
  const produtosBaixoEstoque = produtos
    .filter((p) => p.quantidade_estoque <= 2)
    .sort((a, b) => a.quantidade_estoque - b.quantidade_estoque)
    .slice(0, 5)
    .map((p) => ({ name: p.name, quantidade_estoque: p.quantidade_estoque }))

  const vendasRecentes = (vendasRecentesResult.data ?? []).map((v) => ({
    id: v.id,
    cliente: (v.clientes as any)?.nome ?? "—",
    total: Number(v.total),
    data: v.data_venda,
    forma_pagamento: v.forma_pagamento,
    status: v.status,
  }))

  const dashData = {
    receitaMes,
    receitaMesAnterior,
    totalVendasMes: vendasMes.length,
    totalVendasMesAnterior: vendasMesAnterior.length,
    totalClientes: totalClientesResult.count ?? 0,
    novosClientesMes: clientesMesResult.count ?? 0,
    novosClientesMesAnterior: clientesMesAnteriorResult.count ?? 0,
    totalProdutos: produtos.length,
    produtosSemEstoque,
    vendasRecentes,
    produtosBaixoEstoque,
    vendasPendentes: vendasPendentesResult.count ?? 0,
    vendasCanceladasMes: vendasCanceladasMesResult.count ?? 0,
  }

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
