"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, Star } from "lucide-react"
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
    images: string[]
    product_code: string | null
  }
}

export function ProductForm({ product }: ProductFormProps) {
  const [name, setName] = useState(product?.name || "")
  const [description, setDescription] = useState(product?.description || "")
  const [price, setPrice] = useState(product?.price?.toString() || "")
  const [category, setCategory] = useState(product?.category || "")
  const [categories, setCategories] = useState<string[]>([])
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [sizes, setSizes] = useState(product?.sizes?.join(", ") || "")
  const [available, setAvailable] = useState(product?.available ?? true)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [productCode, setProductCode] = useState(product?.product_code || "")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("products").select("category").not("category", "is", null).order("category")

      if (data) {
        const uniqueCategories = Array.from(new Set(data.map((p) => p.category).filter(Boolean))) as string[]
        setCategories(uniqueCategories)
      }
    }
    fetchCategories()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    console.log("[v0] Files selected:", files?.length)
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      console.log("[v0] Starting upload for", files.length, "files")
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()
        return data.url
      })

      const newUrls = await Promise.all(uploadPromises)
      console.log("[v0] Upload complete. URLs:", newUrls)

      setImages([...images, ...newUrls])
      console.log("[v0] Images state updated:", [...images, ...newUrls])

      toast({
        title: "Imagens enviadas",
        description: `${newUrls.length} imagem(ns) carregada(s) com sucesso`,
      })
    } catch (error) {
      console.error("[v0] Upload error:", error)
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar as imagens",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const setAsPrimary = (index: number) => {
    const newImages = [...images]
    const [selected] = newImages.splice(index, 1)
    newImages.unshift(selected)
    setImages(newImages)
    toast({
      title: "Imagem principal alterada",
      description: "A primeira imagem agora é a principal",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const sizesArray = sizes
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const finalCategory = showNewCategory && newCategory ? newCategory : category

      const productData = {
        name,
        description: description || null,
        price: Number.parseFloat(price),
        category: finalCategory || null,
        sizes: sizesArray,
        available,
        images: images,
        product_code: productCode || null,
      }

      if (product?.id) {
        const { error } = await supabase.from("products").update(productData).eq("id", product.id)

        if (error) throw error

        toast({
          title: "Produto atualizado",
          description: "As alterações foram salvas com sucesso",
        })
      } else {
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
            <Label htmlFor="images">Imagens do Produto *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              A primeira imagem será a principal. Você pode reordenar clicando na estrela.
            </p>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {images.map((url, index) => (
                  <div key={index} className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden group">
                    <Image src={url || "/placeholder.svg"} alt={`Foto ${index + 1}`} fill className="object-cover" />

                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Principal
                      </div>
                    )}

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {index !== 0 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setAsPrimary(index)}
                          title="Definir como principal"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("images")?.click()}
                disabled={uploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Enviando..." : images.length > 0 ? "Adicionar Mais Fotos" : "Escolher Fotos"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_code">Código de Identificação</Label>
            <Input
              id="product_code"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              placeholder="Ex: BLZ-001, SKU123"
            />
            <p className="text-xs text-muted-foreground">Código único para identificar o produto</p>
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
              {!showNewCategory ? (
                <div className="space-y-2">
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewCategory(true)}
                    className="w-full"
                  >
                    + Nova Categoria
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Digite o nome da nova categoria"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNewCategory(false)
                        setNewCategory("")
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (newCategory.trim()) {
                          setCategory(newCategory.trim())
                          setShowNewCategory(false)
                          toast({
                            title: "Nova categoria",
                            description: "A categoria será criada ao salvar o produto",
                          })
                        }
                      }}
                      className="flex-1"
                    >
                      Usar
                    </Button>
                  </div>
                </div>
              )}
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
            <Button type="submit" disabled={saving || uploading || images.length === 0} className="flex-1">
              {saving ? "Salvando..." : product ? "Atualizar" : "Criar Produto"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
