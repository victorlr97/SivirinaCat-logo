"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Pencil, Trash2, Eye, Search } from "lucide-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  const [searchTerm, setSearchTerm] = useState("")
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

  const filteredClientes = clientes.filter((cliente) => {
    const search = searchTerm.toLowerCase()
    return (
      cliente.nome.toLowerCase().includes(search) ||
      cliente.email?.toLowerCase().includes(search) ||
      cliente.telefone?.toLowerCase().includes(search) ||
      cliente.cpf?.toLowerCase().includes(search)
    )
  })

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
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, telefone ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(cliente.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{cliente.nome}</p>
                          {cliente.cpf && <p className="text-xs text-muted-foreground">{cliente.cpf}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{cliente.email || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{cliente.telefone || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {cliente.cidade && cliente.estado
                          ? `${cliente.cidade}, ${cliente.estado}`
                          : cliente.cidade || cliente.estado || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(cliente)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/clientes/${cliente.id}/editar`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(cliente.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
