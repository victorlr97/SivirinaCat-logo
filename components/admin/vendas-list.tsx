"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, Eye, Trash2, Pencil, RefreshCw } from "lucide-react"
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
import { VendaFormDialog } from "./venda-form-dialog"
import { VendaDetailsDialog } from "./venda-details-dialog"
import { VendaStatusDialog, type VendaStatus } from "./venda-status-dialog"
import { cn } from "@/lib/utils"

type Venda = {
  id: string
  cliente_id: string
  data_venda: string
  forma_pagamento: string
  parcelas: number | null
  desconto: number
  total: number
  observacoes: string | null
  status: VendaStatus | null
  pago: boolean | null
  motivo_cancelamento: string | null
  clientes: {
    id: string
    nome: string
  }
}

const STATUS_STYLES: Record<string, string> = {
  concluida: "bg-green-100 text-green-700 border-green-200",
  pendente: "bg-yellow-100 text-yellow-700 border-yellow-200",
  cancelada: "bg-red-100 text-red-700 border-red-200",
  devolucao: "bg-orange-100 text-orange-700 border-orange-200",
}

const STATUS_LABELS: Record<string, string> = {
  concluida: "Concluída",
  pendente: "Pendente",
  cancelada: "Cancelada",
  devolucao: "Devolução",
}

export function VendasList({ vendas }: { vendas: Venda[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editVenda, setEditVenda] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [inspectVendaId, setInspectVendaId] = useState<string | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusVendaId, setStatusVendaId] = useState<string | null>(null)
  const [statusAtual, setStatusAtual] = useState<VendaStatus | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleInspect = (vendaId: string) => {
    setInspectVendaId(vendaId)
    setDetailsDialogOpen(true)
  }

  const handleChangeStatus = (venda: Venda) => {
    setStatusVendaId(venda.id)
    setStatusAtual(venda.status ?? "concluida")
    setStatusDialogOpen(true)
  }

  const handleEdit = async (vendaId: string) => {
    const { data } = await supabase
      .from("vendas")
      .select("*, itens_venda(produto_id, quantidade, preco_unitario, subtotal, products(name))")
      .eq("id", vendaId)
      .single()

    if (data) {
      setEditVenda({
        id: data.id,
        cliente_id: data.cliente_id,
        forma_pagamento: data.forma_pagamento,
        parcelas: data.parcelas,
        desconto: data.desconto,
        total: data.total,
        observacoes: data.observacoes,
        itens: data.itens_venda.map((item: any) => ({
          produto_id: item.produto_id,
          name: item.products?.name ?? "",
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal,
        })),
      })
      setDialogOpen(true)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const { error } = await supabase.from("vendas").delete().eq("id", deleteId)
      if (error) throw error
      toast({ title: "Venda deletada", description: "A venda foi removida com sucesso" })
      router.refresh()
    } catch {
      toast({ title: "Erro ao deletar", description: "Não foi possível deletar a venda", variant: "destructive" })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("pt-BR")

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const getPaymentLabel = (payment: string) => {
    const labels: Record<string, string> = {
      dinheiro: "Dinheiro", pix: "PIX", credito: "Crédito", debito: "Débito", outro: "Outro",
    }
    return labels[payment] || payment
  }

  const StatusBadge = ({ status }: { status: VendaStatus | null }) => {
    const s = status ?? "concluida"
    return (
      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", STATUS_STYLES[s])}>
        {STATUS_LABELS[s]}
      </span>
    )
  }

  const filteredVendas = vendas.filter((venda) => {
    const search = searchTerm.toLowerCase()
    return venda.clientes.nome.toLowerCase().includes(search) || venda.id.toLowerCase().includes(search)
  })

  if (vendas.length === 0) {
    return (
      <>
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por cliente ou ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Nova Venda
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma venda registrada ainda</p>
            <Button onClick={() => setDialogOpen(true)}>Registrar primeira venda</Button>
          </CardContent>
        </Card>
        <VendaFormDialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditVenda(null) }} venda={editVenda} />
      </>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por cliente ou ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Nova Venda
        </Button>
      </div>

      {/* Mobile list */}
      <div className="md:hidden">
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {filteredVendas.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">Nenhuma venda encontrada</p>
            ) : (
              filteredVendas.map((venda) => (
                <div key={venda.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{venda.clientes.nome}</p>
                      <StatusBadge status={venda.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(venda.data_venda)} · {formatCurrency(venda.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getPaymentLabel(venda.forma_pagamento)}
                      {venda.parcelas && venda.parcelas > 1 && ` (${venda.parcelas}x)`}
                      {venda.pago === false && <span className="ml-2 text-yellow-600 font-medium">Não pago</span>}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleInspect(venda.id)} title="Ver detalhes">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleChangeStatus(venda)} title="Alterar status">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(venda.id)} title="Editar">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleteId(venda.id)} title="Deletar">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{venda.clientes.nome}</span>
                          {venda.pago === false && (
                            <p className="text-xs text-yellow-600 font-medium">Não pago</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell><span className="text-sm">{formatDate(venda.data_venda)}</span></TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {getPaymentLabel(venda.forma_pagamento)}
                          {venda.parcelas && venda.parcelas > 1 && ` (${venda.parcelas}x)`}
                        </span>
                      </TableCell>
                      <TableCell><StatusBadge status={venda.status} /></TableCell>
                      <TableCell><span className="text-sm font-medium">{formatCurrency(venda.total)}</span></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleInspect(venda.id)} title="Ver detalhes">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleChangeStatus(venda)} title="Alterar status">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(venda.id)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(venda.id)} title="Deletar">
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
      </div>

      <VendaFormDialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditVenda(null) }} venda={editVenda} />
      <VendaDetailsDialog vendaId={inspectVendaId} open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} />
      <VendaStatusDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen} vendaId={statusVendaId} statusAtual={statusAtual} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja deletar esta venda? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>{deleting ? "Deletando..." : "Deletar"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
