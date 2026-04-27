import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { auth } from "@/lib/firebase/admin"

export async function POST(request: Request) {
  const { token } = await request.json()

  try {
    await auth.verifyIdToken(token)
    const cookieStore = await cookies()
    cookieStore.set("firebase-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
      path: "/",
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("firebase-token")
  return NextResponse.json({ success: true })
}
