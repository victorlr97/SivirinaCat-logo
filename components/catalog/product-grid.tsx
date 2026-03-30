"use client"

import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { useState, useRef } from "react"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  product_code?: string
}

interface ProductGridProps {
  products: Product[]
  searchQuery?: string
}

export function ProductGrid({ products, searchQuery }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">
          {searchQuery?.trim()
            ? `Nenhum produto encontrado para "${searchQuery}".`
            : "Nenhum produto disponível no momento."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const hasMultipleImages = product.images && product.images.length > 1
  const totalImages = product.images?.length || 0

  // Detecta se é dispositivo touch
  const handleTouchStart = (e: React.TouchEvent) => {
    isMobile || setIsMobile(true)
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!hasMultipleImages) return

    const swipeDistance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % totalImages)
      } else {
        setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages)
      }
    }
  }

  // Desktop: troca imagem no hover — Mobile: usa índice do swipe
  const displayImageIndex = !isMobile && isHovered && hasMultipleImages ? 1 : currentImageIndex

  return (
    <Link
      href={`/produto/${product.id}`}
      className="group"
      onMouseEnter={() => hasMultipleImages && setIsHovered(true)}
      onMouseLeave={() => hasMultipleImages && setIsHovered(false)}
    >
      <article className="space-y-4">
        <div
          className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-md touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {product.images && product.images.length > 0 ? (
            <>
              {/* Imagens - renderiza todas mas mostra apenas a atual */}
              {product.images.map((image, index) => (
                <Image
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`${product.name}${index > 0 ? ` - vista ${index + 1}` : ''}`}
                  fill
                  className={`object-cover transition-all duration-500 md:group-hover:scale-105 ${
                    index === displayImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={index === 0}
                />
              ))}

              {/* Indicadores de imagem (mobile) */}
              {hasMultipleImages && (
                <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 md:hidden">
                  {product.images.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "w-4 bg-white"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-muted-foreground">Sem imagem</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-balance font-medium leading-tight tracking-tight text-foreground transition-colors group-hover:text-accent">
            {product.name}
          </h2>
          <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
        </div>
      </article>
    </Link>
  )
}
