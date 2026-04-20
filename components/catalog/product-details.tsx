"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { ImageZoom } from "./image-zoom"

const WHATSAPP_NUMBER = "5532984026283"
const SITE_URL = "https://sivirina.com.br"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.885 3.488" />
    </svg>
  )
}

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
  const images = product.images || []

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
            asChild
            size="lg"
            className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5d] md:w-auto"
          >
            <Link
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Olá! Tenho interesse neste produto.\n${SITE_URL}/produto/${product.id}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Comprar via WhatsApp
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
