// Migração de imagens: Vercel Blob → Firebase Storage
// Rodar uma única vez: node scripts/migrate-images-to-firebase.mjs
// Requer as variáveis do .env.local

import { createRequire } from "module"
import { randomUUID } from "crypto"

const require = createRequire(import.meta.url)
const dotenv = require("dotenv")
dotenv.config({ path: ".env.local" })

const { initializeApp, cert, getApps } = require("firebase-admin/app")
const { getFirestore } = require("firebase-admin/firestore")
const { getStorage } = require("firebase-admin/storage")

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })
}

const db = getFirestore()
const storage = getStorage()

const VERCEL_BLOB_HOST = "vercel-storage.com"

function isVercelBlobUrl(url) {
  return typeof url === "string" && url.includes(VERCEL_BLOB_HOST)
}

function getExtFromUrl(url) {
  const pathname = new URL(url).pathname
  const ext = pathname.split(".").pop()?.toLowerCase()
  return ext || "jpg"
}

function contentTypeFromExt(ext) {
  const map = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" }
  return map[ext] ?? "image/jpeg"
}

async function migrateImage(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status} ao baixar ${url}`)

  const buffer = Buffer.from(await response.arrayBuffer())
  const ext = getExtFromUrl(url)
  const fileName = `produtos/${randomUUID()}.${ext}`

  const bucket = storage.bucket()
  const fileRef = bucket.file(fileName)

  await fileRef.save(buffer, {
    metadata: { contentType: contentTypeFromExt(ext) },
  })

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`
}

async function main() {
  console.log("Iniciando migração de imagens: Vercel Blob → Firebase Storage\n")

  const snap = await db.collection("products").get()
  const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  console.log(`${products.length} produtos encontrados no Firestore\n`)

  let totalMigrated = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const product of products) {
    const images = Array.isArray(product.images) ? product.images : []
    const vercelImages = images.filter(isVercelBlobUrl)

    if (vercelImages.length === 0) {
      console.log(`[OK]   ${product.name} — nenhuma imagem para migrar`)
      totalSkipped++
      continue
    }

    console.log(`[...] ${product.name} — migrando ${vercelImages.length} imagem(ns)`)

    const newImages = [...images]
    let productHadError = false

    for (let i = 0; i < newImages.length; i++) {
      if (!isVercelBlobUrl(newImages[i])) continue

      try {
        const newUrl = await migrateImage(newImages[i])
        console.log(`      ✓ ${newImages[i].split("/").pop().substring(0, 40)} → Firebase Storage`)
        newImages[i] = newUrl
        totalMigrated++
      } catch (err) {
        console.error(`      ✗ Erro na imagem ${i + 1}:`, err.message)
        totalErrors++
        productHadError = true
      }
    }

    if (!productHadError) {
      await db.collection("products").doc(product.id).update({ images: newImages })
      console.log(`      Firestore atualizado\n`)
    } else {
      console.log(`      Firestore NÃO atualizado (houve erros — corrija e rode novamente)\n`)
    }
  }

  console.log("─────────────────────────────────────────────")
  console.log(`Imagens migradas:  ${totalMigrated}`)
  console.log(`Produtos sem blob: ${totalSkipped}`)
  console.log(`Erros:             ${totalErrors}`)
  console.log("─────────────────────────────────────────────")

  if (totalErrors === 0) {
    console.log("\nMigração concluída com sucesso!")
  } else {
    console.log("\nAlgumas imagens falharam. Rode o script novamente para tentar de novo.")
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("Erro fatal:", err)
  process.exit(1)
})
