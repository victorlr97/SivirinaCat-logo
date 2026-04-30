import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/admin"

export const dynamic = 'force-dynamic'
import { verifyAdmin } from "@/lib/firebase/verify-admin"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const data = await request.json()

  await db.collection("vendas").doc(id).update(data)
  return NextResponse.json({ success: true })
}
