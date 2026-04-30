import { NextResponse } from "next/server"
import { auth } from "@/lib/firebase/admin"

export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = [
  "renatorosaemail@gmail.com",
  "carlosrenato.fzc@gmail.com",
  "victorlopesr15@gmail.com",
]

export async function POST(request: Request) {
  const secret = request.headers.get("x-admin-secret")
  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const results = []

  for (const email of ADMIN_EMAILS) {
    try {
      const user = await auth.getUserByEmail(email)
      await auth.setCustomUserClaims(user.uid, { admin: true })
      results.push({ email, status: "ok" })
    } catch (err: any) {
      results.push({ email, status: "erro", message: err.message })
    }
  }

  return NextResponse.json({ results })
}
