// Script corretivo: atualiza apenas tabela_medidas nos produtos do Firestore
// Rodar: node scripts/fix-tabela-medidas.mjs

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

function parseCSV(filePath) {
  const content = readFileSync(filePath, "utf-8")
  // Remove \r de todas as linhas para lidar com CRLF do Windows
  const lines = content.split("\n").map((l) => l.replace(/\r$/, "")).filter((l) => l.trim())
  const headers = parseCSVLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = values[i] ?? "" })
    return obj
  })
}

async function main() {
  console.log("🔧 Corrigindo tabela_medidas nos produtos...")

  const rows = parseCSV("C:/Users/Victor/Desktop/Claude/products_rows.csv")
  let updated = 0
  let skipped = 0

  for (const row of rows) {
    const raw = row.tabela_medidas?.trim()
    if (!raw) { skipped++; continue }

    try {
      JSON.parse(raw) // valida que é JSON válido
      // Armazena como string para evitar limitação do Firestore com arrays aninhados
      await db.collection("products").doc(row.id).update({ tabela_medidas: raw })
      console.log(`  ✅ ${row.name}`)
      updated++
    } catch (err) {
      console.log(`  ❌ ${row.name}: ${err.message}`)
    }
  }

  console.log(`\n✅ ${updated} produtos atualizados, ${skipped} sem tabela.`)
}

main().catch((err) => {
  console.error("Erro:", err)
  process.exit(1)
})
