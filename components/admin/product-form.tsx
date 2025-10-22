"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"
import { upload } from "@vercel/blob/client"
import Image from "next/image"

type ProductFormProps = {
  product?: {
    id: string
    name: string
    description: string | null
    price: number
    category: string | null
    sizes: string[]
    available: boolean
    image_url: string | null
  }
}

export function ProductForm({ product }: ProductFormProps) {
  const [name, setName] = useState(product?.name || "")
  const [description, setDescription] = useState(product?.description || "")
  const [price, setPrice] = useState(product?.price?.toString() || "")
  const [category, setCategory] = useState(product?.category || "")
  const [sizes, setSizes] = useState(product?.sizes?.join(", ") || "")
  const [available, setAvailable] = useState(product?.available ?? true)
  const [imageUrl, setImageUrl] = useState(product?.image_url || "")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })

      setImageUrl(blob.url)
      toast({
        title: "Imagem enviada",
        description: "A imagem foi carregada com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const sizesArray = sizes
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const productData = {
        name,
        description: description || null,
        price: Number.parseFloat(price),
        category: category || null,
        sizes: sizesArray,
        available,
        image_url: imageUrl || null,
      }

      if (product?.id) {
        // Atualizar produto existente
        const { error } = await supabase.from("products").update(productData).eq("id", product.id)

        if (error) throw error

        toast({
          title: "Produto atualizado",
          description: "As alterações foram salvas com sucesso",
        })
      } else {
        // Criar novo produto
        const { error } = await supabase.from("products").insert(productData)

        if (error) throw error

        toast({
          title: "Produto criado",
          description: "O produto foi adicionado ao catálogo",
        })
      }

      router.push("/admin/dashboard")
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o produto",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image">Imagem do Produto</Label>
            <div className="flex flex-col gap-4">
              {imageUrl && (
                <div className="relative w-full aspect-[3/4] max-w-xs bg-muted rounded-lg overflow-hidden">
                  <Image src={imageUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setImageUrl("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image")?.click()}
                  disabled={uploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Enviando..." : "Escolher Imagem"}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Blazer Alfaiataria"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o produto..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Blazers"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sizes">Tamanhos</Label>
            <Input
              id="sizes"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder="Ex: P, M, G (separados por vírgula)"
            />
            <p className="text-xs text-muted-foreground">Separe os tamanhos por vírgula</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="available">Produto Disponível</Label>
              <p className="text-xs text-muted-foreground">Desmarque para ocultar do catálogo público</p>
            </div>
            <Switch id="available" checked={available} onCheckedChange={setAvailable} />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || uploading} className="flex-1">
              {saving ? "Salvando..." : product ? "Atualizar" : "Criar Produto"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
