import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/admin"
import { verifyAdmin } from "@/lib/firebase/verify-admin"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const { status, motivo_cancelamento } = await request.json()

  const restauraEstoque = status === "cancelada" || status === "devolucao"

  if (restauraEstoque) {
    const itensSnap = await db.collection("vendas").doc(id).collection("itens").get()
    const batch = db.batch()

    for (const itemDoc of itensSnap.docs) {
      const item = itemDoc.data()
      const prodRef = db.collection("products").doc(item.produto_id)
      const prod = await prodRef.get()
      if (prod.exists) {
        batch.update(prodRef, {
          quantidade_estoque: (prod.data()!.quantidade_estoque ?? 0) + item.quantidade,
        })
      }
    }

    await batch.commit()
  }

  await db.collection("vendas").doc(id).update({
    status,
    motivo_cancelamento: motivo_cancelamento ?? null,
  })

  return NextResponse.json({ success: true })
}
