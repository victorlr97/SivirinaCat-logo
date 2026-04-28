import { getFirestore, Timestamp } from "firebase-admin/firestore"
import "./admin" // garante inicialização do Admin SDK

const db = getFirestore()

function serialize(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString()
    } else if (value && typeof value === "object" && !Array.isArray(value) && "_seconds" in value) {
      result[key] = new Date(value._seconds * 1000).toISOString()
    } else if (key === "tabela_medidas" && typeof value === "string") {
      try { result[key] = JSON.parse(value) } catch { result[key] = null }
    } else {
      result[key] = value
    }
  }
  return result
}

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type Product = {
  id: string
  name: string
  description: string | null
  product_code: string | null
  category: string | null
  price: number
  sizes: string[]
  images: string[]
  available: boolean
  quantidade_estoque: number
  visivel_catalogo: boolean
  parcelas: string | null
  tabela_medidas: any | null
  created_at: string
}

export type Cliente = {
  id: string
  nome: string
  cpf: string | null
  telefone: string | null
  email: string | null
  rua: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  data_nascimento: string | null
  user_id: string | null
  origem: string | null
  created_at: string
  updated_at: string
}

export type Venda = {
  id: string
  cliente_id: string
  cliente_nome: string
  data_venda: string
  forma_pagamento: string
  parcelas: number | null
  desconto: number
  total: number
  observacoes: string | null
  status: "concluida" | "pendente" | "cancelada" | "devolucao" | null
  pago: boolean | null
  motivo_cancelamento: string | null
}

export type ItemVenda = {
  id: string
  produto_id: string
  name: string
  quantidade: number
  preco_unitario: number
  subtotal: number
}

// ─── PRODUTOS ─────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const snap = await db.collection("products").orderBy("created_at", "desc").get()
  return snap.docs.map((d) => ({ id: d.id, ...serialize(d.data()) } as Product))
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await db.collection("products").doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...serialize(snap.data()!) } as Product
}

export async function getProductsForCatalog(): Promise<Product[]> {
  const snap = await db
    .collection("products")
    .where("visivel_catalogo", "==", true)
    .get()
  return snap.docs
    .map((d) => ({ id: d.id, ...serialize(d.data()) } as Product))
    .filter((p) => p.quantidade_estoque > 0)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

export async function getClientes(): Promise<Cliente[]> {
  const snap = await db.collection("clientes").orderBy("created_at", "desc").get()
  return snap.docs.map((d) => ({ id: d.id, ...serialize(d.data()) } as Cliente))
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const snap = await db.collection("clientes").doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...serialize(snap.data()!) } as Cliente
}

// ─── VENDAS ───────────────────────────────────────────────────────────────────

export async function getVendas(): Promise<Venda[]> {
  const snap = await db.collection("vendas").orderBy("data_venda", "desc").get()
  return snap.docs.map((d) => ({ id: d.id, ...serialize(d.data()) } as Venda))
}

export async function getVenda(id: string): Promise<Venda | null> {
  const snap = await db.collection("vendas").doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...serialize(snap.data()!) } as Venda
}

export async function getVendaItens(vendaId: string): Promise<ItemVenda[]> {
  const snap = await db.collection("vendas").doc(vendaId).collection("itens").get()
  return snap.docs.map((d) => ({ id: d.id, ...serialize(d.data()) } as ItemVenda))
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export async function getDashboardData() {
  const now = new Date()
  const inicioMesAtual = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const fimMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

  const [vendasSnap, clientesSnap, produtosSnap] = await Promise.all([
    db.collection("vendas").orderBy("data_venda", "desc").get(),
    db.collection("clientes").get(),
    db.collection("products").get(),
  ])

  const todasVendas = vendasSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Venda))
  const todosClientes = clientesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Cliente))
  const todosProdutos = produtosSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Product))

  const vendasMes = todasVendas.filter((v) => v.data_venda >= inicioMesAtual)
  const vendasMesAnterior = todasVendas.filter(
    (v) => v.data_venda >= inicioMesAnterior && v.data_venda <= fimMesAnterior
  )
  const clientesMes = todosClientes.filter((c) => c.created_at >= inicioMesAtual)
  const clientesMesAnterior = todosClientes.filter(
    (c) => c.created_at >= inicioMesAnterior && c.created_at <= fimMesAnterior
  )

  const receitaMes = vendasMes.reduce((acc, v) => acc + Number(v.total), 0)
  const receitaMesAnterior = vendasMesAnterior.reduce((acc, v) => acc + Number(v.total), 0)

  const produtosBaixoEstoque = todosProdutos
    .filter((p) => p.quantidade_estoque <= 2)
    .sort((a, b) => a.quantidade_estoque - b.quantidade_estoque)
    .slice(0, 5)
    .map((p) => ({ name: p.name, quantidade_estoque: p.quantidade_estoque }))

  const vendasRecentes = todasVendas.slice(0, 5).map((v) => ({
    id: v.id,
    cliente: v.cliente_nome ?? "—",
    total: Number(v.total),
    data: v.data_venda,
    forma_pagamento: v.forma_pagamento,
    status: v.status,
  }))

  return {
    receitaMes,
    receitaMesAnterior,
    totalVendasMes: vendasMes.length,
    totalVendasMesAnterior: vendasMesAnterior.length,
    totalClientes: todosClientes.length,
    novosClientesMes: clientesMes.length,
    novosClientesMesAnterior: clientesMesAnterior.length,
    totalProdutos: todosProdutos.length,
    produtosSemEstoque: todosProdutos.filter((p) => p.quantidade_estoque === 0).length,
    vendasRecentes,
    produtosBaixoEstoque,
    vendasPendentes: todasVendas.filter((v) => v.status === "pendente").length,
    vendasCanceladasMes: vendasMes.filter((v) => v.status === "cancelada" || v.status === "devolucao").length,
  }
}
