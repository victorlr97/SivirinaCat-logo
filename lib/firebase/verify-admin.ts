import { cookies } from "next/headers"
import { auth } from "./admin"

export async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get("firebase-token")?.value
  if (!token) return null
  try {
    const user = await auth.verifyIdToken(token)
    return (user as any).admin === true ? user : null
  } catch {
    return null
  }
}
