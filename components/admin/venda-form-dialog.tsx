"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Trash2, UserPlus, ChevronDown } from "lucide-react"
import { ClienteForm } from "./cliente-form"

type Cliente = {
  id: string
  nome: string
  cpf: string
}

type Product = {
  id: string
  name: string
  price: number
  product_code: string | null
  quantidade_estoque: number
}

type CartItem = {
  produto_id: string
  name: string
  quantidade: number
  preco_unitario: number
  subtotal: number
}

type VendaExistente = {
  id: string
  cliente_id: string
  forma_pagamento: string
  parcelas: number | null
  desconto: number
  total: number
  observacoes: string | null
  itens: {
    produto_id: string
    name: string
    quantidade: number
    preco_unitario: number
    subtotal: number
  }[]
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  venda?: VendaExistente | null
}

export function VendaFormDialog({ open, onOpenChange, venda }: Props) {
  const isEditing = !!venda

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Product[]>([])
  const [clienteId, setClienteId] = useState("")
  const [searchCliente, setSearchCliente] = useState("")
  const [searchProduto, setSearchProduto] = useState("")
  const [carrinho, setCarrinho] = useState<CartItem[]>([])
  const [formaPagamento, setFormaPagamento] = useState("dinheiro")
  const [parcelas, setParcelas] = useState("1")
  const [descontoPercentual, setDescontoPercentual] = useState("0")
  const [observacoes, setObservacoes] = useState("")
  const [saving, setSaving] = useState(false)
  const [showClienteForm, setShowClienteForm] = useState(false)
  const [clientePopoverOpen, setClientePopoverOpen] = useState(false)
  const [produtoPopoverOpen, setProdutoPopoverOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (open) {
      loadClientes()
      loadProdutos()
    }
  }, [open])

  // Preenche o formulário ao editar
  useEffect(() => {
    if (open && venda) {
      setClienteId(venda.cliente_id)
      setFormaPagamento(venda.forma_pagamento)
      setParcelas(String(venda.parcelas ?? 1))
      setObservacoes(venda.observacoes ?? "")
      setCarrinho(venda.itens.map((item) => ({
        produto_id: item.produto_id,
        name: item.name,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.subtotal,
      })))
      // Recalcula desconto percentual a partir do valor
      const subtotal = venda.itens.reduce((s, i) => s + i.subtotal, 0)
      const pct = subtotal > 0 ? ((venda.desconto / subtotal) * 100).toFixed(2) : "0"
      setDescontoPercentual(pct)
    } else if (open && !venda) {
      resetForm()
    }
  }, [open, venda])

  const resetForm = () => {
    setClienteId("")
    setSearchCliente("")
    setCarrinho([])
    setFormaPagamento("dinheiro")
    setParcelas("1")
    setDescontoPercentual("0")
    setObservacoes("")
  }

  const loadClientes = async () => {
    const { data } = await supabase.from("clientes").select("id, nome, cpf").order("nome")
    setClientes(data || [])
  }

  const loadProdutos = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, product_code, quantidade_estoque")
      .eq("available", true)
    setProdutos(data || [])
  }

  const addToCart = (produto: Product) => {
    const existing = carrinho.find((item) => item.produto_id === produto.id)
    if (existing) {
      setCarrinho(
        carrinho.map((item) =>
          item.produto_id === produto.id
            ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.preco_unitario }
            : item,
        ),
      )
    } else {
      setCarrinho([...carrinho, {
        produto_id: produto.id,
        name: produto.name,
        quantidade: 1,
        preco_unitario: produto.price,
        subtotal: produto.price,
      }])
    }
    setSearchProduto("")
    setProdutoPopoverOpen(false)
  }

  const updateQuantity = (produto_id: string, quantidade: number) => {
    if (quantidade <= 0) { removeFromCart(produto_id); return }
    setCarrinho(carrinho.map((item) =>
      item.produto_id === produto_id
        ? { ...item, quantidade, subtotal: quantidade * item.preco_unitario }
        : item,
    ))
  }

  const removeFromCart = (produto_id: string) => {
    setCarrinho(carrinho.filter((item) => item.produto_id !== produto_id))
  }

  const calculateTotal = () => {
    const subtotal = carrinho.reduce((sum, item) => sum + item.subtotal, 0)
    const descontoValor = (subtotal * Number.parseFloat(descontoPercentual || "0")) / 100
    return subtotal - descontoValor
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clienteId) {
      toast({ title: "Cliente não selecionado", description: "Selecione um cliente para continuar", variant: "destructive" })
      return
    }
    if (carrinho.length === 0) {
      toast({ title: "Carrinho vazio", description: "Adicione pelo menos um produto", variant: "destructive" })
      return
    }

    setSaving(true)

    try {
      const total = calculateTotal()
      const subtotal = carrinho.reduce((sum, item) => sum + item.subtotal, 0)
      const descontoValor = (subtotal * Number.parseFloat(descontoPercentual || "0")) / 100

      if (isEditing && venda) {
        // UPDATE venda existente
        const { error: vendaError } = await supabase
          .from("vendas")
          .update({
            cliente_id: clienteId,
            forma_pagamento: formaPagamento,
            parcelas: formaPagamento === "credito" ? Number.parseInt(parcelas) : null,
            desconto: descontoValor,
            total,
            observacoes: observacoes || null,
          })
          .eq("id", venda.id)

        if (vendaError) throw vendaError

        // Restaura estoque dos itens antigos
        for (const itemAntigo of venda.itens) {
          const { data: prodData } = await supabase
            .from("products")
            .select("quantidade_estoque")
            .eq("id", itemAntigo.produto_id)
            .single()
          if (prodData) {
            await supabase
              .from("products")
              .update({ quantidade_estoque: prodData.quantidade_estoque + itemAntigo.quantidade })
              .eq("id", itemAntigo.produto_id)
          }
        }

        // Remove itens antigos e insere novos
        await supabase.from("itens_venda").delete().eq("venda_id", venda.id)
        const novosItens = carrinho.map((item) => ({
          venda_id: venda.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal,
        }))
        const { error: itensError } = await supabase.from("itens_venda").insert(novosItens)
        if (itensError) throw itensError

        // Deduz estoque dos novos itens
        for (const item of carrinho) {
          const { data: prodData } = await supabase
            .from("products")
            .select("quantidade_estoque")
            .eq("id", item.produto_id)
            .single()
          if (prodData) {
            await supabase
              .from("products")
              .update({ quantidade_estoque: prodData.quantidade_estoque - item.quantidade })
              .eq("id", item.produto_id)
          }
        }

        toast({ title: "Venda atualizada", description: "A venda foi editada com sucesso" })

      } else {
        // INSERT nova venda
        const { data: vendaData, error: vendaError } = await supabase
          .from("vendas")
          .insert({
            cliente_id: clienteId,
            forma_pagamento: formaPagamento,
            parcelas: formaPagamento === "credito" ? Number.parseInt(parcelas) : null,
            desconto: descontoValor,
            total,
            observacoes: observacoes || null,
          })
          .select()

        if (vendaError) throw vendaError
        const novaVenda = vendaData[0]
        if (!novaVenda) throw new Error("Erro ao criar venda")

        const itens = carrinho.map((item) => ({
          venda_id: novaVenda.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal,
        }))
        const { error: itensError } = await supabase.from("itens_venda").insert(itens)
        if (itensError) throw itensError

        for (const item of carrinho) {
          const { data: prodData } = await supabase
            .from("products")
            .select("quantidade_estoque")
            .eq("id", item.produto_id)
            .single()
          if (prodData) {
            await supabase
              .from("products")
              .update({ quantidade_estoque: prodData.quantidade_estoque - item.quantidade })
              .eq("id", item.produto_id)
          }
        }

        toast({ title: "Venda registrada", description: "A venda foi salva com sucesso e o estoque foi atualizado" })
      }

      resetForm()
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar a venda",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleClienteCreated = () => {
    setShowClienteForm(false)
    loadClientes()
  }

  const filteredClientes = clientes.filter((c) => c.nome.toLowerCase().includes(searchCliente.toLowerCase()))
  const filteredProdutos = produtos.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduto.toLowerCase()) ||
      p.product_code?.toLowerCase().includes(searchProduto.toLowerCase()),
  )
  const selectedCliente = clientes.find((c) => c.id === clienteId)

  return (
    <>
      <Dialog open={open && !showClienteForm} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[92vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-3 flex-shrink-0">
            <DialogTitle>{isEditing ? "Editar Venda" : "Nova Venda"}</DialogTitle>
            <DialogDescription>{isEditing ? "Edite os dados da venda" : "Registre uma nova venda"}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 space-y-4">

              {/* Cliente */}
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <div className="flex gap-2">
                  <Popover open={clientePopoverOpen} onOpenChange={setClientePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="flex-1 justify-between bg-transparent overflow-hidden">
                        {selectedCliente ? (
                          <span className="flex items-center gap-1 min-w-0 overflow-hidden">
                            <span className="truncate">{selectedCliente.nome}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">({selectedCliente.cpf})</span>
                          </span>
                        ) : (
                          "Selecionar Cliente"
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar cliente..."
                            value={searchCliente}
                            onChange={(e) => setSearchCliente(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
                        {filteredClientes.length > 0 ? (
                          filteredClientes.map((cliente) => (
                            <Button
                              key={cliente.id}
                              type="button"
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => { setClienteId(cliente.id); setClientePopoverOpen(false); setSearchCliente("") }}
                            >
                              <span className="flex items-center gap-2">
                                {cliente.nome}
                                <span className="text-xs text-muted-foreground">({cliente.cpf})</span>
                              </span>
                            </Button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">Nenhum cliente encontrado</div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button type="button" variant="outline" onClick={() => setShowClienteForm(true)}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Produtos */}
              <div className="space-y-2">
                <Label>Adicionar Produtos</Label>
                <Popover open={produtoPopoverOpen} onOpenChange={setProdutoPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between bg-transparent">
                      Selecionar Produto
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar produto por nome ou código..."
                          value={searchProduto}
                          onChange={(e) => setSearchProduto(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
                      {filteredProdutos.length > 0 ? (
                        filteredProdutos.map((produto) => (
                          <Button
                            key={produto.id}
                            type="button"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => addToCart(produto)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {produto.name} - R$ {produto.price.toFixed(2)}
                            {produto.product_code && (
                              <span className="ml-2 text-muted-foreground">({produto.product_code})</span>
                            )}
                          </Button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">Nenhum produto encontrado</div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Carrinho */}
              {carrinho.length > 0 && (
                <div className="space-y-2">
                  <Label>Carrinho</Label>
                  <div className="rounded-md border divide-y">
                    {carrinho.map((item) => (
                      <div key={item.produto_id} className="flex items-center gap-3 px-4 py-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Unitário: R$ {item.preco_unitario.toFixed(2)} · Subtotal: R$ {item.subtotal.toFixed(2)}
                          </p>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) => updateQuantity(item.produto_id, Number.parseInt(e.target.value))}
                          className="w-16 h-9 text-sm text-center flex-shrink-0"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 flex-shrink-0"
                          onClick={() => removeFromCart(item.produto_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pagamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Forma de Pagamento *</Label>
                  <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="credito">Crédito</SelectItem>
                      <SelectItem value="debito">Débito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formaPagamento === "credito" && (
                  <div className="space-y-2">
                    <Label>Parcelas</Label>
                    <Input type="number" min="1" max="12" value={parcelas} onChange={(e) => setParcelas(e.target.value)} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Desconto (%)</Label>
                  <Input
                    type="number" min="0" max="100" step="0.01"
                    value={descontoPercentual}
                    onChange={(e) => setDescontoPercentual(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações sobre a venda..."
                  rows={2}
                  className="resize-none"
                />
              </div>

              {carrinho.length > 0 && (
                <div className="flex justify-end items-baseline gap-2 pb-2">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">R$ {calculateTotal().toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 px-6 py-4 border-t flex-shrink-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "Salvando..." : isEditing ? "Salvar Alterações" : "Registrar Venda"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showClienteForm} onOpenChange={setShowClienteForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>Cadastre um novo cliente</DialogDescription>
          </DialogHeader>
          <ClienteForm onSuccess={handleClienteCreated} onCancel={() => setShowClienteForm(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
