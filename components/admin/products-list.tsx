"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Pencil, Trash2, Search, Plus } from "lucide-react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { ProductForm } from "./product-form"

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  sizes: string[]
  available: boolean
  images: string[]
  product_code: string | null
  created_at: string
  quantidade_estoque: number
  visivel_catalogo: boolean // Added visibility field
}

export function ProductsList({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      const { error } = await supabase.from("products").delete().eq("id", deleteId)

      if (error) throw error

      toast({
        title: "Produto deletado",
        description: "O produto foi removido com sucesso",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar o produto",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setEditModalOpen(true)
  }

  const handleAddSuccess = () => {
    setAddModalOpen(false)
    router.refresh()
  }

  const handleEditSuccess = () => {
    setEditModalOpen(false)
    setEditingProduct(null)
    router.refresh()
  }

  const handleToggleVisibility = async (productId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase.from("products").update({ visivel_catalogo: !currentValue }).eq("id", productId)

      if (error) throw error

      toast({
        title: "Visibilidade atualizada",
        description: !currentValue ? "Produto agora está visível no catálogo" : "Produto foi ocultado do catálogo",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a visibilidade",
        variant: "destructive",
      })
    }
  }

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(search) ||
      product.product_code?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search)
    )
  })

  if (products.length === 0) {
    return (
      <>
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, código ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum produto cadastrado ainda</p>
            <Button onClick={() => setAddModalOpen(true)}>Adicionar primeiro produto</Button>
          </CardContent>
        </Card>

        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Produto</DialogTitle>
              <DialogDescription>Preencha os dados do novo produto</DialogDescription>
            </DialogHeader>
            <ProductForm onSuccess={handleAddSuccess} onCancel={() => setAddModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visível</TableHead> {/* Added visibility column */}
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              Sem foto
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.sizes.length > 0 && (
                            <p className="text-xs text-muted-foreground">Tamanhos: {product.sizes.join(", ")}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{product.product_code || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{product.category || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">R$ {product.price.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-medium ${product.quantidade_estoque === 0 ? "text-destructive" : ""}`}
                      >
                        {product.quantidade_estoque} {product.quantidade_estoque === 1 ? "unidade" : "unidades"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.available ? "default" : "secondary"}>
                        {product.available ? "Disponível" : "Indisponível"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={product.visivel_catalogo}
                        onCheckedChange={() => handleToggleVisibility(product.id, product.visivel_catalogo)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(product.id)}>
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

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
            <DialogDescription>Preencha os dados do novo produto</DialogDescription>
          </DialogHeader>
          <ProductForm onSuccess={handleAddSuccess} onCancel={() => setAddModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>Atualize os dados do produto</DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editingProduct || undefined}
            onSuccess={handleEditSuccess}
            onCancel={() => {
              setEditModalOpen(false)
              setEditingProduct(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita.
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
