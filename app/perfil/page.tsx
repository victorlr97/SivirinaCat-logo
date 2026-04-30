export const dynamic = 'force-dynamic'

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { auth } from "@/lib/firebase/admin"
import { getFirestore } from "firebase-admin/firestore"
import "@/lib/firebase/admin"

export default async function PerfilPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("firebase-token")?.value

  if (!token) redirect("/login")

  let email: string
  try {
    const decoded = await auth.verifyIdToken(token)
    email = decoded.email!
  } catch {
    redirect("/login")
  }

  const db = getFirestore()
  const snap = await db.collection("clientes").where("email", "==", email).limit(1).get()

  if (snap.empty) redirect("/login")

  const clientData = { id: snap.docs[0].id, ...snap.docs[0].data() } as any

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
              {clientData.data_nascimento && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Data de Nascimento
                  </label>
                  <p className="text-base">
                    {new Date(clientData.data_nascimento).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
            </div>

            {(clientData.rua || clientData.cidade) && (
              <div className="pt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </label>
                <p className="text-base">
                  {clientData.rua}
                  {clientData.numero && `, ${clientData.numero}`}
                  {clientData.complemento && ` - ${clientData.complemento}`}
                </p>
                <p className="text-base text-muted-foreground">
                  {clientData.bairro && `${clientData.bairro} - `}
                  {clientData.cidade}/{clientData.estado}
                </p>
                {clientData.cep && (
                  <p className="text-base text-muted-foreground">CEP: {clientData.cep}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
