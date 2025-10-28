"use client"

import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  product_code?: string
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Nenhum produto disponível no momento.</p>
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
  const [isHovered, setIsHovered] = useState(false)
  const hasMultipleImages = product.images && product.images.length > 1

  return (
    <Link
      href={`/produto/${product.id}`}
      className="group"
      onMouseEnter={() => hasMultipleImages && setIsHovered(true)}
      onMouseLeave={() => hasMultipleImages && setIsHovered(false)}
    >
      <article className="space-y-4">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-md">
          {product.images && product.images.length > 0 ? (
            <>
              {/* Primeira imagem (visível por padrão, invisível no hover) */}
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                fill
                className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                  isHovered && hasMultipleImages ? "opacity-0" : "opacity-100"
                }`}
                sizes="(max-width: 768px) 100vw, 33vw"
              />

              {/* Segunda imagem (invisível por padrão, visível no hover) */}
              {hasMultipleImages && (
                <Image
                  src={product.images[1] || "/placeholder.svg"}
                  alt={`${product.name} - vista alternativa`}
                  fill
                  className={`absolute inset-0 object-cover transition-all duration-500 group-hover:scale-105 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
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
