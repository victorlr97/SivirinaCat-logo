"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getVendaItens, updateProduct, updateVenda, getProduct } from "@/lib/firebase/db"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export type VendaStatus = "concluida" | "pendente" | "cancelada" | "devolucao"

const STATUS_OPTIONS: { value: VendaStatus; label: string; description: string; color: string }[] = [
  {
    value: "concluida",
    label: "Concluída",
    description: "Venda finalizada com pagamento confirmado",
    color: "border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  {
    value: "pendente",
    label: "Pendente",
    description: "Aguardando confirmação de pagamento",
    color: "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  },
  {
    value: "cancelada",
    label: "Cancelada",
    description: "Venda cancelada, estoque será restaurado",
    color: "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
  {
    value: "devolucao",
    label: "Devolução",
    description: "Produto devolvido, estoque será restaurado",
    color: "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  },
]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vendaId: string | null
  statusAtual: VendaStatus | null
}

export function VendaStatusDialog({ open, onOpenChange, vendaId, statusAtual }: Props) {
  const [novoStatus, setNovoStatus] = useState<VendaStatus | null>(null)
  const [motivo, setMotivo] = useState("")
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const precisaMotivo = novoStatus === "cancelada" || novoStatus === "devolucao"
  const restauraEstoque = novoStatus === "cancelada" || novoStatus === "devolucao"

  const handleSave = async () => {
    if (!vendaId || !novoStatus) return
    if (precisaMotivo && !motivo.trim()) {
      toast({ title: "Motivo obrigatório", description: "Informe o motivo do cancelamento ou devolução", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      if (restauraEstoque) {
        const itens = await getVendaItens(vendaId)
        for (const item of itens) {
          const prod = await getProduct(item.produto_id)
          if (prod) {
            await updateProduct(item.produto_id, {
              quantidade_estoque: prod.quantidade_estoque + item.quantidade,
            })
          }
        }
      }

      await updateVenda(vendaId, {
        status: novoStatus,
        motivo_cancelamento: motivo.trim() || null,
      })

      toast({ title: "Status atualizado", description: `Venda marcada como ${STATUS_OPTIONS.find(s => s.value === novoStatus)?.label}` })
      onOpenChange(false)
      setNovoStatus(null)
      setMotivo("")
      router.refresh()
    } catch (err) {
      toast({ title: "Erro ao atualizar", description: "Não foi possível atualizar o status", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleClose = (v: boolean) => {
    if (!v) { setNovoStatus(null); setMotivo("") }
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Alterar Status</DialogTitle>
          <DialogDescription>Selecione o novo status da venda</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.filter(s => s.value !== statusAtual).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setNovoStatus(opt.value)}
                className={cn(
                  "rounded-lg border-2 p-3 text-left transition-all",
                  novoStatus === opt.value
                    ? opt.color + " border-2"
                    : "border-border hover:border-muted-foreground/40"
                )}
              >
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{opt.description}</p>
              </button>
            ))}
          </div>

          {precisaMotivo && (
            <div className="space-y-2">
              <Label>Motivo *</Label>
              <Textarea
                placeholder="Ex: Produto com defeito, tamanho errado, desistência..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => handleClose(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={!novoStatus || saving}>
              {saving ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
