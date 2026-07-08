"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Ruler, Minus, Plus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { ImageZoom } from "./image-zoom"
import {
  trackProductViewed,
  trackSizeGuideOpened,
  trackPurchaseInquiryStarted,
  trackOutboundLinkOpened,
} from "@/lib/amplitude"
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon"
import { WHATSAPP_NUMBER, SITE_URL } from "@/lib/constants"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"

interface TabelaMedidas {
  colunas: string[]
  linhas: string[][]
  notas?: string[]
}

interface Product {
  id: string
  name: string
  description?: string
  price: number
  images: string[]
  sizes?: string[]
  product_code?: string
  parcelas?: string
  tabela_medidas?: TabelaMedidas | null
}

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [showMedidasModal, setShowMedidasModal] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const images = product.images || []
  const { addItem } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    trackProductViewed({
      productId: product.id,
      productName: product.name,
      productType: "produto",
      priceBrl: product.price,
      currency: "BRL",
      availabilityStatus: "available",
      entrySource: document.referrer.includes("/catalogo") ? "catalog" : "direct",
    })
  }, [product.id, product.name, product.price])

  const handleSizeGuideOpen = () => {
    setShowMedidasModal(true)
    trackSizeGuideOpened({
      productId: product.id,
      productName: product.name,
      productType: "produto",
      sizeGuideType: "tabela_medidas",
    })
  }

  const handleWhatsAppClick = () => {
    trackPurchaseInquiryStarted({
      productId: product.id,
      productName: product.name,
      productType: "produto",
      priceBrl: product.price,
      currency: "BRL",
      outboundChannel: "whatsapp",
      messageTemplate: "product_inquiry",
    })
    trackOutboundLinkOpened({
      destinationDomain: "wa.me",
      destinationPath: `/${WHATSAPP_NUMBER}`,
      linkLabel: "Comprar via WhatsApp",
      outboundChannel: "whatsapp",
      pageContext: "product_page",
    })
  }

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Selecione um tamanho",
        description: "Escolha um tamanho antes de adicionar ao carrinho.",
        variant: "destructive",
      })
      return
    }

    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: images[0] || null,
        size: selectedSize,
      },
      quantity,
    )

    toast({
      title: "Adicionado ao carrinho",
      description: `${product.name}${selectedSize ? ` (${selectedSize})` : ""} x${quantity}`,
    })

    setQuantity(1)
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

        <p className="max-w-xs text-xs text-muted-foreground">
          *Modelo digital criada por IA. A peça é real e pode apresentar leves variações de tom e de detalhes.
        </p>
      </div>

      {/* Detalhes do Produto */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-balance text-3xl font-medium leading-tight tracking-tight md:text-4xl mb-0">{product.name}</h1>

          {product.product_code && <p className="text-sm text-muted-foreground">Código: {product.product_code}</p>}

          <p className="text-2xl font-medium mb-0">{formatCurrency(product.price)}</p>
          {product.parcelas && (
            <p className="text-sm text-muted-foreground">{product.parcelas}</p>
          )}
        </div>

        {product.description && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground mb-0">Descrição</h2>
            <p className="text-pretty leading-relaxed">{product.description}</p>
          </div>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-2 mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">Tamanhos disponíveis</h2>
            <div className="flex flex-wrap gap-2 mb-0">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`inline-flex items-center justify-center rounded border px-4 py-2 text-sm transition-colors ${
                    selectedSize === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background hover:border-foreground/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {product.tabela_medidas && product.tabela_medidas.colunas.length > 0 && (
              <button
                type="button"
                onClick={handleSizeGuideOpen}
                className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Ruler className="h-4 w-4" />
                Tabela de Medidas
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-4">
          <span className="text-sm font-medium text-muted-foreground">Quantidade</span>
          <div className="flex items-center rounded border border-border">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              disabled={quantity <= 1}
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="inline-flex items-center gap-2"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-5 w-5" />
            Adicionar ao Carrinho
          </Button>

          <Button
            asChild
            size="lg"
            className="bg-green-700 text-white hover:bg-green-800"
          >
            <Link
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Olá! Tenho interesse neste produto.\n${SITE_URL}/produto/${product.id}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
              onClick={handleWhatsAppClick}
            >
              <WhatsAppIcon className="h-5 w-5" />
              Comprar via WhatsApp
            </Link>
          </Button>
        </div>
      </div>

      {/* Modal Tabela de Medidas */}
      <Dialog open={showMedidasModal} onOpenChange={setShowMedidasModal}>
        <DialogContent className="max-w-[90vw] overflow-hidden p-4 sm:max-w-lg sm:p-6">
          <DialogHeader className="text-left pr-8">
            <DialogTitle>Tabela de Medidas</DialogTitle>
          </DialogHeader>

          {product.tabela_medidas && (
            <div className="space-y-4 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {product.tabela_medidas.colunas.map((coluna, index) => (
                        <th
                          key={index}
                          className="whitespace-nowrap border-b border-border px-2 py-2 text-left text-xs font-medium sm:px-4 sm:py-3 sm:text-sm"
                        >
                          {coluna}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.tabela_medidas.linhas.map((linha, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border last:border-0">
                        {linha.map((celula, cellIndex) => (
                          <td
                            key={cellIndex}
                            className={`whitespace-nowrap px-2 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm ${cellIndex === 0 ? "font-medium" : "text-muted-foreground"}`}
                          >
                            {celula}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {product.tabela_medidas.notas && product.tabela_medidas.notas.length > 0 && (
                <div className="space-y-1 text-xs text-muted-foreground">
                  {product.tabela_medidas.notas.map((nota, index) => (
                    <p key={index}>{nota}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
