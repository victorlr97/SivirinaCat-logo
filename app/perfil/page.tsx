import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react"

export default async function PerfilPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignore errors in Server Components
          }
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get client data
  const { data: clientData } = await supabase.from("clientes").select("*").eq("user_id", user.id).single()

  if (!clientData) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Meu Perfil</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-base">{clientData.nome}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">CPF</label>
                <p className="text-base">{clientData.cpf}</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-base">{clientData.email}</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Telefone
                </label>
                <p className="text-base">{clientData.telefone}</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Data de Nascimento
                </label>
                <p className="text-base">{new Date(clientData.data_nascimento).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Endereço
              </label>
              <p className="text-base">
                {clientData.endereco_rua}
                {clientData.endereco_numero && `, ${clientData.endereco_numero}`}
                {clientData.endereco_complemento && ` - ${clientData.endereco_complemento}`}
              </p>
              <p className="text-base text-muted-foreground">
                {clientData.endereco_bairro} - {clientData.endereco_cidade}/{clientData.endereco_estado}
              </p>
              <p className="text-base text-muted-foreground">CEP: {clientData.endereco_cep}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
