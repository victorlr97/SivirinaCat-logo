"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
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
import Image from "next/image"

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  sizes: string[]
  available: boolean
  image_url: string | null
  created_at: string
}

export function ProductsList({ products }: { products: Product[] }) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
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

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">Nenhum produto cadastrado ainda</p>
          <Button asChild>
            <Link href="/admin/produtos/novo">Adicionar primeiro produto</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-[3/4] relative bg-muted">
              {product.image_url ? (
                <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">R$ {product.price.toFixed(2)}</p>
                </div>
                <Badge variant={product.available ? "default" : "secondary"}>
                  {product.available ? "Disponível" : "Indisponível"}
                </Badge>
              </div>
              {product.sizes.length > 0 && (
                <p className="text-xs text-muted-foreground mb-3">Tamanhos: {product.sizes.join(", ")}</p>
              )}
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Link href={`/admin/produtos/${product.id}/editar`}>
                    <Pencil className="mr-2 h-3 w-3" />
                    Editar
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleteId(product.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
