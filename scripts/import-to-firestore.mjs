// Script de importação: Supabase CSV → Firestore
// Rodar uma única vez: node scripts/import-to-firestore.mjs
// Requer as variáveis do .env.local

import { readFileSync } from "fs"
import { createRequire } from "module"

const require = createRequire(import.meta.url)
const dotenv = require("dotenv")
dotenv.config({ path: ".env.local" })

const { initializeApp, cert, getApps } = require("firebase-admin/app")
const { getFirestore } = require("firebase-admin/firestore")

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = getFirestore()

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function parseCSV(filePath) {
  const content = readFileSync(filePath, "utf-8")
  const lines = content.split("\n").filter((l) => l.trim())
  const headers = parseCSVLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? ""
    })
    return obj
  })
}

function parseCSVLine(line) {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

function parseJsonField(value) {
  if (!value || value.trim() === "") return null
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function parseNumber(value) {
  if (!value || value.trim() === "") return null
  const n = parseFloat(value)
  return isNaN(n) ? null : n
}

function parseBoolean(value) {
  if (value === "true") return true
  if (value === "false") return false
  return null
}

async function importCollection(name, docs) {
  const BATCH_SIZE = 400
  let count = 0
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch()
    const chunk = docs.slice(i, i + BATCH_SIZE)
    for (const { id, data } of chunk) {
      const ref = db.collection(name).doc(id)
      batch.set(ref, data)
    }
    await batch.commit()
    count += chunk.length
    console.log(`  ${name}: ${count}/${docs.length} importados`)
  }
}

// ─── PRODUTOS ─────────────────────────────────────────────────────────────────

async function importProducts() {
  console.log("\n📦 Importando produtos...")
  const rows = parseCSV("C:/Users/Victor/Desktop/Claude/products_rows.csv")

  const docs = rows.map((row) => ({
    id: row.id,
    data: {
      name: row.name || "",
      description: row.description || null,
      price: parseNumber(row.price) ?? 0,
      category: row.category || null,
      sizes: parseJsonField(row.sizes) ?? [],
      available: parseBoolean(row.available) ?? true,
      product_code: row.product_code || null,
      images: parseJsonField(row.images) ?? [],
      quantidade_estoque: parseNumber(row.quantidade_estoque) ?? 0,
      visivel_catalogo: parseBoolean(row.visivel_catalogo) ?? false,
      tabela_medidas: parseJsonField(row.tabela_medidas) ?? null,
      created_at: row.created_at || new Date().toISOString(),
    },
  }))

  await importCollection("products", docs)
  console.log(`✅ ${docs.length} produtos importados`)
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

async function importClientes() {
  console.log("\n👥 Importando clientes...")
  const rows = parseCSV("C:/Users/Victor/Desktop/Claude/clientes_rows.csv")

  const docs = rows.map((row) => ({
    id: row.id,
    data: {
      nome: row.nome || "",
      cpf: row.cpf || null,
      telefone: row.telefone || null,
      email: row.email || null,
      rua: row.rua || null,
      numero: row.numero || null,
      complemento: row.complemento || null,
      bairro: row.bairro || null,
      cidade: row.cidade || null,
      estado: row.estado || null,
      cep: row.cep || null,
      data_nascimento: row.data_nascimento || null,
      user_id: row.user_id || null,
      origem: row.origem || null,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString(),
    },
  }))

  await importCollection("clientes", docs)
  console.log(`✅ ${docs.length} clientes importados`)
  return Object.fromEntries(rows.map((r) => [r.id, r.nome]))
}

// ─── VENDAS ───────────────────────────────────────────────────────────────────

async function importVendas(clienteNomes) {
  console.log("\n🛍️  Importando vendas...")
  const vendas = parseCSV("C:/Users/Victor/Desktop/Claude/vendas_rows.csv")
  const itens = parseCSV("C:/Users/Victor/Desktop/Claude/itens_venda_rows.csv")

  const itensByVenda = {}
  for (const item of itens) {
    if (!itensByVenda[item.venda_id]) itensByVenda[item.venda_id] = []
    itensByVenda[item.venda_id].push(item)
  }

  const docs = vendas.map((row) => ({
    id: row.id,
    data: {
      cliente_id: row.cliente_id,
      cliente_nome: clienteNomes[row.cliente_id] ?? "—",
      data_venda: row.data_venda || new Date().toISOString(),
      forma_pagamento: row.forma_pagamento || "",
      parcelas: parseNumber(row.parcelas),
      desconto: parseNumber(row.desconto) ?? 0,
      total: parseNumber(row.total) ?? 0,
      observacoes: row.observacoes || null,
      status: row.status || null,
      pago: parseBoolean(row.pago),
      motivo_cancelamento: row.motivo_cancelamento || null,
      created_at: row.created_at || new Date().toISOString(),
    },
  }))

  await importCollection("vendas", docs)

  console.log("\n  Importando itens das vendas...")
  let totalItens = 0
  for (const venda of vendas) {
    const vendaItens = itensByVenda[venda.id] ?? []
    if (vendaItens.length === 0) continue
    const batch = db.batch()
    for (const item of vendaItens) {
      const ref = db.collection("vendas").doc(venda.id).collection("itens").doc(item.id)
      batch.set(ref, {
        produto_id: item.produto_id,
        quantidade: parseNumber(item.quantidade) ?? 1,
        preco_unitario: parseNumber(item.preco_unitario) ?? 0,
        subtotal: parseNumber(item.subtotal) ?? 0,
      })
    }
    await batch.commit()
    totalItens += vendaItens.length
  }

  console.log(`✅ ${docs.length} vendas e ${totalItens} itens importados`)
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Iniciando importação para o Firestore...")
  await importProducts()
  const clienteNomes = await importClientes()
  await importVendas(clienteNomes)
  console.log("\n✅ Importação concluída!")
}

main().catch((err) => {
  console.error("❌ Erro na importação:", err)
  process.exit(1)
})
