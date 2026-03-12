"use client"

import Link from "next/link"
import { TrendingUp, TrendingDown, Minus, ShoppingBag, Users, Package, AlertTriangle, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DashboardData {
  // Receita
  receitaMes: number
  receitaMesAnterior: number
  // Vendas
  totalVendasMes: number
  totalVendasMesAnterior: number
  // Clientes
  totalClientes: number
  novosClientesMes: number
  novosClientesMesAnterior: number
  // Produtos
  totalProdutos: number
  produtosSemEstoque: number
  // Vendas recentes
  vendasRecentes: {
    id: string
    cliente: string
    total: number
    data: string
    forma_pagamento: string
  }[]
  // Alertas
  produtosBaixoEstoque: { name: string; quantidade_estoque: number }[]
}

function calcVariacao(atual: number, anterior: number) {
  if (anterior === 0) return atual > 0 ? 100 : 0
  return Math.round(((atual - anterior) / anterior) * 100)
}

function VariacaoBadge({ atual, anterior }: { atual: number; anterior: number }) {
  const variacao = calcVariacao(atual, anterior)
  if (variacao > 0)
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600">
        <TrendingUp className="h-3 w-3" />+{variacao}% vs mês anterior
      </span>
    )
  if (variacao < 0)
    return (
      <span className="flex items-center gap-1 text-xs text-destructive">
        <TrendingDown className="h-3 w-3" />
        {variacao}% vs mês anterior
      </span>
    )
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" />
      Igual ao mês anterior
    </span>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

function getPaymentLabel(forma: string) {
  const map: Record<string, string> = {
    dinheiro: "Dinheiro",
    pix: "PIX",
    credito: "Crédito",
    debito: "Débito",
  }
  return map[forma] ?? forma
}

export function DashboardStats({ data }: { data: DashboardData }) {
  const cards = [
    {
      label: "Receita do mês",
      value: formatCurrency(data.receitaMes),
      variacao: <VariacaoBadge atual={data.receitaMes} anterior={data.receitaMesAnterior} />,
      icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
      href: "/admin/vendas",
    },
    {
      label: "Vendas realizadas",
      value: String(data.totalVendasMes),
      variacao: <VariacaoBadge atual={data.totalVendasMes} anterior={data.totalVendasMesAnterior} />,
      icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
      href: "/admin/vendas",
    },
    {
      label: "Clientes cadastrados",
      value: String(data.totalClientes),
      variacao: <VariacaoBadge atual={data.novosClientesMes} anterior={data.novosClientesMesAnterior} />,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      href: "/admin/clientes",
    },
    {
      label: "Produtos em estoque",
      value: String(data.totalProdutos - data.produtosSemEstoque),
      variacao: (
        <span className="text-xs text-muted-foreground">
          {data.produtosSemEstoque > 0
            ? `${data.produtosSemEstoque} sem estoque`
            : "Todos com estoque"}
        </span>
      ),
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      href: "/admin/produtos",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Cards de métricas */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:border-foreground/20 transition-colors cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-muted-foreground leading-tight">{card.label}</span>
                  {card.icon}
                </div>
                <p className="text-3xl font-light mb-2">{card.value}</p>
                {card.variacao}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Linha inferior: vendas recentes + alertas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Vendas recentes */}
        <Card className="lg:col-span-3">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-medium">Vendas recentes</h2>
              <Button variant="ghost" size="sm" asChild className="text-xs h-7 px-2">
                <Link href="/admin/vendas" className="flex items-center gap-1">
                  Ver todas <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>

            {data.vendasRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma venda registrada</p>
            ) : (
              <div className="divide-y">
                {data.vendasRecentes.map((venda) => (
                  <div key={venda.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{venda.cliente}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(venda.data)} · {getPaymentLabel(venda.forma_pagamento)}
                      </p>
                    </div>
                    <span className="text-sm font-medium flex-shrink-0 ml-4">
                      {formatCurrency(venda.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h2 className="text-sm font-medium mb-5">Alertas</h2>

            {data.novosClientesMes > 0 && (
              <div className="flex items-start gap-3 py-3 border-b">
                <Users className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    {data.novosClientesMes} novo{data.novosClientesMes > 1 ? "s" : ""} cliente{data.novosClientesMes > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">neste mês</p>
                </div>
              </div>
            )}

            {data.produtosBaixoEstoque.length === 0 && data.novosClientesMes === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum alerta no momento</p>
            )}

            {data.produtosBaixoEstoque.length > 0 && (
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-medium text-amber-600">Estoque baixo ou zerado</span>
                </div>
                {data.produtosBaixoEstoque.map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate flex-1">{p.name}</p>
                    <Badge
                      variant={p.quantidade_estoque === 0 ? "destructive" : "secondary"}
                      className="ml-2 text-[10px] flex-shrink-0"
                    >
                      {p.quantidade_estoque === 0 ? "Zerado" : `${p.quantidade_estoque} un.`}
                    </Badge>
                  </div>
                ))}
                <Button variant="ghost" size="sm" asChild className="text-xs h-7 px-2 mt-1">
                  <Link href="/admin/produtos" className="flex items-center gap-1">
                    Gerenciar produtos <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
