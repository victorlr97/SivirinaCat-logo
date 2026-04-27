import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/firebase/admin"

function isAdmin(user: { admin?: boolean }): boolean {
  return user.admin === true
}

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get("firebase-token")?.value

  let user = null
  if (token) {
    try {
      user = await auth.verifyIdToken(token)
    } catch {
      // Token inválido ou expirado
    }
  }

  if (request.nextUrl.pathname.startsWith("/perfil")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
  }

  if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin") {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin"
      return NextResponse.redirect(url)
    }

    if (!isAdmin(user)) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  if (request.nextUrl.pathname === "/admin" && user) {
    if (isAdmin(user)) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/dashboard"
      return NextResponse.redirect(url)
    } else {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next({ request })
}
