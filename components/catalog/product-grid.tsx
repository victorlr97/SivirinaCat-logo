import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

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
        <Link key={product.id} href={`/produto/${product.id}`} className="group">
          <article className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
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
      ))}
    </div>
  )
}
