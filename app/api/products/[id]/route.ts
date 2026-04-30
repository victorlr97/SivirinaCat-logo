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

  const toSave = {
    ...data,
    tabela_medidas:
      data.tabela_medidas != null
        ? typeof data.tabela_medidas === "string"
          ? data.tabela_medidas
          : JSON.stringify(data.tabela_medidas)
        : null,
  }

  await db.collection("products").doc(id).update(toSave)
  return NextResponse.json({ success: true })
}
