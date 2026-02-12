"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

type VendaDetails = {
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
    cpf: string
  }
}

type ItemVenda = {
  id: string
  produto_id: string
  quantidade: number
  preco_unitario: number
  subtotal: number
  products: {
    id: string
    name: string
    product_code: string
  }
}

interface VendaDetailsDialogProps {
  vendaId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VendaDetailsDialog({ vendaId, open, onOpenChange }: VendaDetailsDialogProps) {
  const [venda, setVenda] = useState<VendaDetails | null>(null)
  const [itens, setItens] = useState<ItemVenda[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (vendaId && open) {
      loadVendaDetails()
    }
  }, [vendaId, open])

  const loadVendaDetails = async () => {
    if (!vendaId) return

    setLoading(true)
    try {
      // Buscar dados da venda
      const { data: vendaData, error: vendaError } = await supabase
        .from("vendas")
        .select("*, clientes(id, nome, cpf)")
        .eq("id", vendaId)
        .single()

      if (vendaError) throw vendaError

      // Buscar itens da venda
      const { data: itensData, error: itensError } = await supabase
        .from("itens_venda")
        .select("*, products(id, name, product_code)")
        .eq("venda_id", vendaId)

      if (itensError) throw itensError

      setVenda(vendaData)
      setItens(itensData || [])
    } catch (error) {
      console.error("Erro ao carregar detalhes da venda:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da venda",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Venda</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : venda ? (
          <div className="space-y-6">
            {/* Informações Gerais */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Informações da Venda</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{venda.clientes.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium">{venda.clientes.cpf || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{formatDate(venda.data_venda)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Forma de Pagamento</p>
                  <Badge variant="outline" className="mt-1">
                    {getPaymentLabel(venda.forma_pagamento)}
                    {venda.parcelas && venda.parcelas > 1 && ` (${venda.parcelas}x)`}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">ID da Venda</p>
                  <p className="font-mono text-xs mt-1 break-all">{venda.id}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Produtos */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Produtos</h3>
              {itens.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Produto</th>
                        <th className="text-center p-3 text-sm font-medium">Código</th>
                        <th className="text-center p-3 text-sm font-medium">Qtd</th>
                        <th className="text-right p-3 text-sm font-medium">Preço Unit.</th>
                        <th className="text-right p-3 text-sm font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3 text-sm">{item.products.name}</td>
                          <td className="p-3 text-sm text-center font-mono">{item.products.product_code}</td>
                          <td className="p-3 text-sm text-center">{item.quantidade}</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(item.preco_unitario)}</td>
                          <td className="p-3 text-sm text-right font-medium">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <Separator />

            {/* Totais */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Resumo</h3>
              <div className="space-y-2">
                {venda.desconto > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto</span>
                    <span className="text-green-600 font-medium">- {formatCurrency(venda.desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-xl">{formatCurrency(venda.total)}</span>
                </div>
              </div>
            </div>

            {/* Observações */}
            {venda.observacoes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Observações</h3>
                  <p className="text-sm text-muted-foreground">{venda.observacoes}</p>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
