// Cadastra secrets no GCP Secret Manager a partir do .env.local
// Rodar uma única vez: node scripts/create-secrets.mjs
// Não requer gcloud — usa as credenciais do Service Account

import { createRequire } from "module"

const require = createRequire(import.meta.url)
const dotenv = require("dotenv")
dotenv.config({ path: ".env.local" })

const { initializeApp, cert, getApps } = require("firebase-admin/app")

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })

const PROJECT = process.env.FIREBASE_PROJECT_ID
const BASE = `https://secretmanager.googleapis.com/v1/projects/${PROJECT}`

async function getToken() {
  const token = await app.options.credential.getAccessToken()
  return token.access_token
}

async function upsertSecret(name, value) {
  if (!value) {
    console.error(`✗ ${name} não encontrado no .env.local — pulando`)
    return
  }

  const token = await getToken()
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }

  // Tenta criar o secret
  const createRes = await fetch(`${BASE}/secrets?secretId=${name}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ replication: { automatic: {} } }),
  })

  if (!createRes.ok && createRes.status !== 409) {
    const err = await createRes.text()
    throw new Error(`Erro ao criar ${name}: ${err}`)
  }

  if (createRes.status === 409) {
    console.log(`  ${name} já existe — adicionando nova versão`)
  }

  // Adiciona versão com o valor
  const data = Buffer.from(value, "utf8").toString("base64")
  const versionRes = await fetch(`${BASE}/secrets/${name}:addSecretVersion`, {
    method: "POST",
    headers,
    body: JSON.stringify({ payload: { data } }),
  })

  if (!versionRes.ok) {
    const err = await versionRes.text()
    throw new Error(`Erro ao adicionar versão de ${name}: ${err}`)
  }

  console.log(`✓ ${name}`)
}

async function main() {
  console.log("Cadastrando secrets no Secret Manager...\n")

  const secrets = [
    { name: "FIREBASE_CLIENT_EMAIL", value: process.env.FIREBASE_CLIENT_EMAIL },
    {
      name: "FIREBASE_PRIVATE_KEY",
      value: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    { name: "ADMIN_SETUP_SECRET", value: process.env.ADMIN_SETUP_SECRET },
  ]

  for (const s of secrets) {
    await upsertSecret(s.name, s.value)
  }

  console.log("\nConcluído!")
}

main().catch((err) => {
  console.error("Erro fatal:", err.message)
  process.exit(1)
})
