"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Pencil, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { ClienteDetails } from "./cliente-details"

type Cliente = {
  id: string
  nome: string
  cpf: string | null
  telefone: string | null
  email: string | null
  rua: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  ano_nascimento: number | null
  created_at: string
  updated_at: string
}

export function ClientesList({ clientes }: { clientes: Cliente[] }) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      const { error } = await supabase.from("clientes").delete().eq("id", deleteId)

      if (error) throw error

      toast({
        title: "Cliente deletado",
        description: "O cliente foi removido com sucesso",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar o cliente",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleViewDetails = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setDetailsOpen(true)
  }

  const handleEditFromDetails = (cliente: Cliente) => {
    router.push(`/admin/clientes/${cliente.id}/editar`)
  }

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  if (clientes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">Nenhum cliente cadastrado ainda</p>
          <Button asChild>
            <Link href="/admin/clientes/novo">Adicionar primeiro cliente</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientes.map((cliente) => (
          <Card key={cliente.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">{getInitials(cliente.nome)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1 truncate">{cliente.nome}</h3>
                  {cliente.email && <p className="text-sm text-muted-foreground truncate">{cliente.email}</p>}
                  {cliente.telefone && <p className="text-sm text-muted-foreground">{cliente.telefone}</p>}
                </div>
              </div>

              {(cliente.cidade || cliente.estado) && (
                <p className="text-xs text-muted-foreground mb-4">
                  {cliente.cidade}
                  {cliente.cidade && cliente.estado && ", "}
                  {cliente.estado}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleViewDetails(cliente)}
                >
                  <Eye className="mr-2 h-3 w-3" />
                  Ver
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Link href={`/admin/clientes/${cliente.id}/editar`}>
                    <Pencil className="mr-2 h-3 w-3" />
                    Editar
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleteId(cliente.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ClienteDetails
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        cliente={selectedCliente}
        onEditClick={handleEditFromDetails}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
