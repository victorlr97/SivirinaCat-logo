"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Copy, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { ImageZoom } from "./image-zoom"

const INSTAGRAM_URL = "https://ig.me/m/sivirinamoda"
const SITE_URL = "https://sivirina.com.br"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  images: string[]
  sizes?: string[]
  product_code?: string
}

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const images = product.images || []

  const productUrl = `${SITE_URL}/produto/${product.id}`

  const prefilledMessage = `Olá! Tenho interesse neste produto:

${product.name}${product.product_code ? ` (Código: ${product.product_code})` : ""}
Valor: ${formatCurrency(product.price)}

Link: ${productUrl}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prefilledMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("[v0] Erro ao copiar mensagem:", error)
    }
  }

  const handleCopyAndOpen = async () => {
    await handleCopy()
    window.open(INSTAGRAM_URL, "_blank", "noopener,noreferrer")
    setIsDialogOpen(false)
  }

  return (
    <div className="grid gap-12 md:grid-cols-2 md:gap-16">
      {/* Galeria de Imagens */}
      <div className="space-y-4">
        {/* Container sem overflow-hidden para permitir zoom aparecer fora */}
        <div className="relative aspect-[3/4]">
          <div className="absolute inset-0 overflow-hidden rounded-lg bg-muted shadow-md">
            {images.length > 0 ? (
              <ImageZoom
                src={images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                zoomScale={2.5}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-muted-foreground">Sem imagem</span>
              </div>
            )}
          </div>
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-[3/4] overflow-hidden rounded-md bg-muted shadow-sm transition-opacity ${
                  selectedImage === index ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} - Foto ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 12.5vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detalhes do Produto */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-balance text-3xl font-medium leading-tight tracking-tight md:text-4xl">{product.name}</h1>

          {product.product_code && <p className="text-sm text-muted-foreground">Código: {product.product_code}</p>}

          <p className="text-2xl font-medium">{formatCurrency(product.price)}</p>
        </div>

        {product.description && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Descrição</h2>
            <p className="text-pretty leading-relaxed">{product.description}</p>
          </div>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Tamanhos Disponíveis</h2>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center justify-center rounded border border-border bg-background px-4 py-2 text-sm"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button
            size="lg"
            className="w-full md:w-auto"
            onClick={() => setIsDialogOpen(true)}
          >
            <Instagram className="h-5 w-5" />
            Comprar via Instagram
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] overflow-hidden sm:max-w-lg">
          <DialogHeader className="min-w-0 pr-6">
            <DialogTitle className="text-balance">Finalize sua compra no Instagram</DialogTitle>
            <DialogDescription className="text-pretty">
              Copie a mensagem abaixo e cole no chat para que a loja já saiba qual produto voc&ecirc; quer.
            </DialogDescription>
          </DialogHeader>

          <div className="min-w-0">
            <div className="overflow-hidden rounded-md border border-border bg-muted/50 p-4">
              <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">
                {prefilledMessage}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              className="w-full sm:w-auto"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Mensagem copiada
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar mensagem
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleCopyAndOpen}
              className="w-full sm:w-auto"
            >
              <Instagram className="h-4 w-4" />
              Copiar e abrir Instagram
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
