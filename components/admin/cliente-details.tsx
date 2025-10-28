"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Edit, MapPin, Phone, Mail, Calendar, User, Copy, Cake } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

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

interface ClienteDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente: Cliente | null
  onEditClick?: (cliente: Cliente) => void
}

export function ClienteDetails({ open, onOpenChange, cliente, onEditClick }: ClienteDetailsProps) {
  const { toast } = useToast()

  if (!cliente) return null

  const initials = cliente.nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const handleEditClick = () => {
    if (onEditClick && cliente) {
      onEditClick(cliente)
      onOpenChange(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        description: `${label} copiado para a área de transferência`,
        duration: 2000,
      })
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  const hasAddressInfo =
    cliente.cep || cliente.rua || cliente.numero || cliente.bairro || cliente.cidade || cliente.estado

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 py-2">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-bold">{cliente.nome}</h2>
            {cliente.cpf && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{cliente.cpf}</span>
                <button
                  onClick={() => copyToClipboard(cliente.cpf!, "CPF")}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-1" />

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-[20px_1fr] items-center gap-x-2 gap-y-3">
            {cliente.telefone && (
              <>
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-1">
                  <span>{cliente.telefone}</span>
                  <button
                    onClick={() => copyToClipboard(cliente.telefone!, "Telefone")}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </>
            )}

            {cliente.email && (
              <>
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-1">
                  <span className="truncate">{cliente.email}</span>
                  <button
                    onClick={() => copyToClipboard(cliente.email!, "Email")}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </>
            )}

            {cliente.ano_nascimento && (
              <>
                <Cake className="h-4 w-4 text-muted-foreground" />
                <span>Nascimento: {cliente.ano_nascimento}</span>
              </>
            )}

            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal">
                Cliente desde {formatDate(cliente.created_at)}
              </Badge>
            </div>
          </div>
        </div>

        {hasAddressInfo && (
          <>
            <Separator className="my-1" />

            <div className="py-2">
              <h3 className="text-sm font-medium mb-2">Endereço</h3>
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  {cliente.rua && (
                    <p>
                      {cliente.rua}
                      {cliente.numero && `, ${cliente.numero}`}
                      {cliente.complemento && `, ${cliente.complemento}`}
                    </p>
                  )}
                  {(cliente.bairro || cliente.cidade || cliente.estado) && (
                    <p>
                      {cliente.bairro && `${cliente.bairro}`}
                      {cliente.cidade && cliente.bairro && ` - `}
                      {cliente.cidade && `${cliente.cidade}`}
                      {cliente.estado && cliente.cidade && `/`}
                      {cliente.estado && `${cliente.estado}`}
                    </p>
                  )}
                  {cliente.cep && <p>{cliente.cep}</p>}
                </div>
              </div>
            </div>
          </>
        )}

        <DialogFooter className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button size="sm" onClick={handleEditClick}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
