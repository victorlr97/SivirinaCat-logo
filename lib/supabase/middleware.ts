import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Se houver erro de JWT inválido, redirecionar para página de limpeza
  if (error && error.message.includes("does not exist")) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/clear-session"
    return NextResponse.redirect(url)
  }

  if (request.nextUrl.pathname.startsWith("/perfil")) {
    if (!user) {
      // Not authenticated - redirect to login
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
  }

  if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin") {
    if (!user) {
      // Não autenticado - redireciona para login do admin
      const url = request.nextUrl.clone()
      url.pathname = "/admin"
      return NextResponse.redirect(url)
    }

    // Verifica se usuário está na tabela admins
    const { data: adminData } = await supabase.from("admins").select("id").eq("user_id", user.id).single()

    if (!adminData) {
      // Usuário autenticado mas NÃO é admin - redireciona para home
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  // Se usuário autenticado tenta acessar /admin (página de login), verifica se é admin
  if (request.nextUrl.pathname === "/admin" && user) {
    // Verifica se é admin
    const { data: adminData } = await supabase.from("admins").select("id").eq("user_id", user.id).single()

    if (adminData) {
      // É admin - redireciona para dashboard
      const url = request.nextUrl.clone()
      url.pathname = "/admin/dashboard"
      return NextResponse.redirect(url)
    } else {
      // Não é admin - redireciona para home
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
