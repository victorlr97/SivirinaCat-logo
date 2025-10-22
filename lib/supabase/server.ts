import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Cria um cliente Supabase para uso no servidor (Server Components, Route Handlers, Server Actions)
 * IMPORTANTE: Sempre crie um novo cliente dentro de cada função (não use variáveis globais)
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // O método "setAll" foi chamado de um Server Component.
          // Isso pode ser ignorado se você tiver middleware atualizando as sessões.
        }
      },
    },
  })
}
