"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, Eye, Trash2, Pencil } from "lucide-react"
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

type Venda = {
  id: string
  cliente_id: string
  data_venda: string
  forma_pagamento: string
  parcelas: number | null
  desconto: number
  total: number
  observacoes: string | null
  clientes: {
    id: string
    nome: string
  }
}

export function VendasList({ vendas }: { vendas: Venda[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editVenda, setEditVenda] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [inspectVendaId, setInspectVendaId] = useState<string | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleInspect = (vendaId: string) => {
    setInspectVendaId(vendaId)
    setDetailsDialogOpen(true)
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

      toast({
        title: "Venda deletada",
        description: "A venda foi removida com sucesso",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar a venda",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getPaymentLabel = (payment: string) => {
    const labels: Record<string, string> = {
      dinheiro: "Dinheiro",
      pix: "PIX",
      credito: "Crédito",
      debito: "Débito",
      outro: "Outro",
    }
    return labels[payment] || payment
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
            <Input
              placeholder="Buscar por cliente ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Venda
          </Button>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma venda registrada ainda</p>
            <Button onClick={() => setDialogOpen(true)}>Registrar primeira venda</Button>
          </CardContent>
        </Card>

      <VendaFormDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditVenda(null) }}
        venda={editVenda}
      />
      </>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
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
                    <p className="text-sm font-medium truncate">{venda.clientes.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(venda.data_venda)} · {formatCurrency(venda.total)}</p>
                    <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0">
                      {getPaymentLabel(venda.forma_pagamento)}
                      {venda.parcelas && venda.parcelas > 1 && ` (${venda.parcelas}x)`}
                    </Badge>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleInspect(venda.id)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(venda.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleteId(venda.id)}>
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
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell>
                        <span className="font-medium">{venda.clientes.nome}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(venda.data_venda)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPaymentLabel(venda.forma_pagamento)}
                          {venda.parcelas && venda.parcelas > 1 && ` (${venda.parcelas}x)`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{formatCurrency(venda.total)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleInspect(venda.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(venda.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(venda.id)}>
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

        <VendaFormDialog
          open={dialogOpen}
          onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditVenda(null) }}
          venda={editVenda}
        />

      <VendaDetailsDialog 
        vendaId={inspectVendaId} 
        open={detailsDialogOpen} 
        onOpenChange={setDetailsDialogOpen}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta venda? Esta ação não pode ser desfeita.
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
