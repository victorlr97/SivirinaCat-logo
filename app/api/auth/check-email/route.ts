import { NextResponse } from "next/server"
import { auth } from "@/lib/firebase/admin"

export async function POST(request: Request) {
  const { email } = await request.json()

  try {
    await auth.getUserByEmail(email)
    return NextResponse.json({ exists: true, has_password: true })
  } catch {
    return NextResponse.json({ exists: false, has_password: false })
  }
}
