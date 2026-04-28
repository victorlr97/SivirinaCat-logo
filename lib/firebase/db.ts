import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore"
import app from "./client"
import { getFirestore } from "firebase/firestore"

const db = getFirestore(app)

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

export type ItemVenda = {
  produto_id: string
  name: string
  quantidade: number
  preco_unitario: number
  subtotal: number
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

// ─── PRODUTOS ─────────────────────────────────────────────────────────────────

function parseProduct(id: string, data: any): Product {
  return {
    ...data,
    id,
    tabela_medidas: typeof data.tabela_medidas === "string"
      ? (() => { try { return JSON.parse(data.tabela_medidas) } catch { return null } })()
      : data.tabela_medidas ?? null,
  } as Product
}

export async function getProducts(): Promise<Product[]> {
  const q = query(collection(db, "products"), orderBy("created_at", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => parseProduct(d.id, d.data()))
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id))
  if (!snap.exists()) return null
  return parseProduct(snap.id, snap.data())
}

function serializeProduct(data: any) {
  return {
    ...data,
    tabela_medidas: data.tabela_medidas
      ? typeof data.tabela_medidas === "string"
        ? data.tabela_medidas
        : JSON.stringify(data.tabela_medidas)
      : null,
  }
}

export async function createProduct(data: Omit<Product, "id" | "created_at">) {
  const ref = await addDoc(collection(db, "products"), {
    ...serializeProduct(data),
    created_at: serverTimestamp(),
  })
  return ref.id
}

export async function updateProduct(id: string, data: Partial<Omit<Product, "id" | "created_at">>) {
  await updateDoc(doc(db, "products", id), serializeProduct(data))
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, "products", id))
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

export async function getClientes(): Promise<Cliente[]> {
  const q = query(collection(db, "clientes"), orderBy("created_at", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cliente))
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const snap = await getDoc(doc(db, "clientes", id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Cliente
}

export async function createCliente(data: Omit<Cliente, "id" | "created_at" | "updated_at">) {
  const ref = await addDoc(collection(db, "clientes"), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
  return ref.id
}

export async function updateCliente(id: string, data: Partial<Omit<Cliente, "id" | "created_at">>) {
  await updateDoc(doc(db, "clientes", id), {
    ...data,
    updated_at: serverTimestamp(),
  })
}

export async function deleteCliente(id: string) {
  await deleteDoc(doc(db, "clientes", id))
}

// ─── VENDAS ───────────────────────────────────────────────────────────────────

export async function getVendas(): Promise<Venda[]> {
  const q = query(collection(db, "vendas"), orderBy("data_venda", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venda))
}

export async function getVenda(id: string): Promise<Venda | null> {
  const snap = await getDoc(doc(db, "vendas", id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Venda
}

export async function getVendaItens(vendaId: string): Promise<ItemVenda[]> {
  const snap = await getDocs(collection(db, "vendas", vendaId, "itens"))
  return snap.docs.map((d) => d.data() as ItemVenda)
}

export async function createVenda(
  data: Omit<Venda, "id">,
  itens: ItemVenda[]
): Promise<string> {
  const vendaRef = await addDoc(collection(db, "vendas"), {
    ...data,
    created_at: serverTimestamp(),
  })

  const batch = writeBatch(db)
  for (const item of itens) {
    const itemRef = doc(collection(db, "vendas", vendaRef.id, "itens"))
    batch.set(itemRef, item)
  }
  await batch.commit()

  return vendaRef.id
}

export async function updateVenda(id: string, data: Partial<Omit<Venda, "id">>) {
  await updateDoc(doc(db, "vendas", id), data)
}

export async function deleteVenda(id: string) {
  const itensSnap = await getDocs(collection(db, "vendas", id, "itens"))
  const batch = writeBatch(db)
  itensSnap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(doc(db, "vendas", id))
  await batch.commit()
}
