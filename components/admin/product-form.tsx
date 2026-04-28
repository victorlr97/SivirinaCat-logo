"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getProducts, createProduct } from "@/lib/firebase/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, Star, Plus, Trash2, Ruler } from "lucide-react"
import Image from "next/image"

interface TabelaMedidas {
  colunas: string[]
  linhas: string[][]
  notas: string[]
}

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
    quantidade_estoque: number
    parcelas: string | null
    tabela_medidas: TabelaMedidas | null
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name || "")
  const [description, setDescription] = useState(product?.description || "")
  const [price, setPrice] = useState(product?.price?.toString() || "")
  const [parcelas, setParcelas] = useState(product?.parcelas || "")
  const [category, setCategory] = useState(product?.category || "")
  const [categories, setCategories] = useState<string[]>([])
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [sizes, setSizes] = useState(product?.sizes?.join(", ") || "")
  const [quantidadeEstoque, setQuantidadeEstoque] = useState(product?.quantidade_estoque?.toString() || "0")
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [productCode, setProductCode] = useState(product?.product_code || "")
  const [tabelaMedidas, setTabelaMedidas] = useState<TabelaMedidas>(
    product?.tabela_medidas || { colunas: [], linhas: [], notas: [] }
  )
  const [showTabelaEditor, setShowTabelaEditor] = useState(
    !!(product?.tabela_medidas && product.tabela_medidas.colunas.length > 0)
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCategories = async () => {
      const products = await getProducts()
      const uniqueCategories = Array.from(
        new Set(products.map((p) => p.category).filter(Boolean))
      ) as string[]
      setCategories(uniqueCategories.sort())
    }
    fetchCategories()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
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

      setImages([...images, ...newUrls])

      toast({
        title: "Imagens enviadas",
        description: `${newUrls.length} imagem(ns) carregada(s) com sucesso`,
      })
    } catch (error) {
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
        parcelas: parcelas || null,
        category: finalCategory || null,
        sizes: sizesArray,
        quantidade_estoque: Number.parseInt(quantidadeEstoque),
        images: images,
        product_code: productCode || null,
        tabela_medidas: showTabelaEditor && tabelaMedidas.colunas.length > 0 ? tabelaMedidas : null,
        available: true,
        visivel_catalogo: true,
      }

      if (product?.id) {
        const res = await fetch(`/api/products/${product.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        })
        if (!res.ok) throw new Error("Falha ao atualizar produto")
        toast({
          title: "Produto atualizado",
          description: "As alterações foram salvas com sucesso",
        })
      } else {
        await createProduct(productData)
        toast({
          title: "Produto criado",
          description: "O produto foi adicionado ao catálogo",
        })
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/admin/produtos")
        router.refresh()
      }
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
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
              <Label htmlFor="parcelas">Parcelamento sem juros</Label>
              <Input
                id="parcelas"
                value={parcelas}
                onChange={(e) => setParcelas(e.target.value)}
                placeholder="Ex: em até 10x sem juros"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          {/* Tabela de Medidas */}
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <Label>Tabela de Medidas</Label>
              </div>
              <Button
                type="button"
                variant={showTabelaEditor ? "destructive" : "outline"}
                size="sm"
                onClick={() => {
                  if (showTabelaEditor) {
                    setTabelaMedidas({ colunas: [], linhas: [], notas: [] })
                  } else {
                    setTabelaMedidas({
                      colunas: ["Tamanho", "Busto", "Cintura", "Quadril"],
                      linhas: [["P", "", "", ""]],
                      notas: ["*Medidas em cm"],
                    })
                  }
                  setShowTabelaEditor(!showTabelaEditor)
                }}
              >
                {showTabelaEditor ? "Remover Tabela" : "Adicionar Tabela"}
              </Button>
            </div>

            {showTabelaEditor && (
              <div className="space-y-4">
                {/* Tabela Editável */}
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        {tabelaMedidas.colunas.map((coluna, index) => (
                          <th key={index} className="group relative border-b border-r border-border last:border-r-0">
                            <input
                              type="text"
                              value={coluna}
                              onChange={(e) => {
                                const newColunas = [...tabelaMedidas.colunas]
                                newColunas[index] = e.target.value
                                setTabelaMedidas({ ...tabelaMedidas, colunas: newColunas })
                              }}
                              className="w-full bg-transparent px-3 py-2 text-left font-medium outline-none focus:bg-background"
                              placeholder="Coluna"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newColunas = tabelaMedidas.colunas.filter((_, i) => i !== index)
                                const newLinhas = tabelaMedidas.linhas.map((linha) =>
                                  linha.filter((_, i) => i !== index)
                                )
                                setTabelaMedidas({ ...tabelaMedidas, colunas: newColunas, linhas: newLinhas })
                              }}
                              className="absolute -top-2 -right-2 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs group-hover:flex"
                              title="Remover coluna"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </th>
                        ))}
                        <th className="w-10 border-b border-border bg-muted/30">
                          <button
                            type="button"
                            onClick={() => {
                              const newColunas = [...tabelaMedidas.colunas, ""]
                              const newLinhas = tabelaMedidas.linhas.map((linha) => [...linha, ""])
                              setTabelaMedidas({ ...tabelaMedidas, colunas: newColunas, linhas: newLinhas })
                            }}
                            className="flex h-full w-full items-center justify-center py-2 text-muted-foreground hover:text-foreground"
                            title="Adicionar coluna"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabelaMedidas.linhas.map((linha, rowIndex) => (
                        <tr key={rowIndex} className="group border-b border-border last:border-b-0">
                          {linha.map((celula, cellIndex) => (
                            <td key={cellIndex} className="border-r border-border last:border-r-0">
                              <input
                                type="text"
                                value={celula}
                                onChange={(e) => {
                                  const newLinhas = [...tabelaMedidas.linhas]
                                  newLinhas[rowIndex][cellIndex] = e.target.value
                                  setTabelaMedidas({ ...tabelaMedidas, linhas: newLinhas })
                                }}
                                className={`w-full bg-transparent px-3 py-2 outline-none focus:bg-muted/30 ${cellIndex === 0 ? "font-medium" : ""}`}
                                placeholder={tabelaMedidas.colunas[cellIndex] || ""}
                              />
                            </td>
                          ))}
                          <td className="w-10 bg-muted/10">
                            <button
                              type="button"
                              onClick={() => {
                                const newLinhas = tabelaMedidas.linhas.filter((_, i) => i !== rowIndex)
                                setTabelaMedidas({ ...tabelaMedidas, linhas: newLinhas })
                              }}
                              className="flex h-full w-full items-center justify-center py-2 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                              title="Remover linha"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/10">
                        <td colSpan={tabelaMedidas.colunas.length + 1}>
                          <button
                            type="button"
                            onClick={() => {
                              const newLinha = new Array(tabelaMedidas.colunas.length).fill("")
                              setTabelaMedidas({
                                ...tabelaMedidas,
                                linhas: [...tabelaMedidas.linhas, newLinha],
                              })
                            }}
                            className="flex w-full items-center justify-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                            Adicionar linha
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Notas */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Notas de rodapé (opcional)</Label>
                  <div className="space-y-2">
                    {tabelaMedidas.notas.map((nota, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={nota}
                          onChange={(e) => {
                            const newNotas = [...tabelaMedidas.notas]
                            newNotas[index] = e.target.value
                            setTabelaMedidas({ ...tabelaMedidas, notas: newNotas })
                          }}
                          className="h-8"
                          placeholder="Ex: *Medidas em cm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => {
                            const newNotas = tabelaMedidas.notas.filter((_, i) => i !== index)
                            setTabelaMedidas({ ...tabelaMedidas, notas: newNotas })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTabelaMedidas({
                          ...tabelaMedidas,
                          notas: [...tabelaMedidas.notas, ""],
                        })
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Adicionar Nota
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade_estoque">Quantidade em Estoque *</Label>
            <Input
              id="quantidade_estoque"
              type="number"
              min="0"
              value={quantidadeEstoque}
              onChange={(e) => setQuantidadeEstoque(e.target.value)}
              required
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Produtos com estoque 0 ficam automaticamente indisponíveis no catálogo
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 bg-transparent"
            >
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
