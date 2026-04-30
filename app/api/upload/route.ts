import { NextResponse } from "next/server"
import { storage } from "@/lib/firebase/admin"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split(".").pop()
    const fileName = `produtos/${randomUUID()}.${ext}`

    const bucket = storage.bucket()
    const fileRef = bucket.file(fileName)

    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    })

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`

    return NextResponse.json({ url })
  } catch (error) {
    console.error("[firebase] Upload error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
