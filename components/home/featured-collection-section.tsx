"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface Product {
  id: string
  name: string
  category: string
  price: number
  images: string[]
}

interface FeaturedCollectionSectionProps {
  products: Product[]
}

// Componente do card de produto individual
function ProductCard({ product, emotionalContext, index }: { product: Product; emotionalContext: string; index: number }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [showSecondImage, setShowSecondImage] = useState(false)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const hasMultipleImages = product.images && product.images.length > 1
  const totalImages = product.images?.length || 0

  // Hover timer para desktop
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isHovered && hasMultipleImages) {
      // Espera 500ms (0.5s) antes de trocar a imagem
      timer = setTimeout(() => {
        setShowSecondImage(true)
      }, 500)
    } else {
      setShowSecondImage(false)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isHovered, hasMultipleImages])

  // Detecta swipe no mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!hasMultipleImages) return

    const swipeDistance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50 // mínimo de 50px para considerar um swipe

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe para esquerda - próxima imagem
        setCurrentImageIndex((prev) => (prev + 1) % totalImages)
      } else {
        // Swipe para direita - imagem anterior
        setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages)
      }
    }
  }

  // No desktop usa hover, no mobile usa currentImageIndex
  const displayImageIndex = isHovered && showSecondImage && hasMultipleImages ? 1 : currentImageIndex

  return (
    <div
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/produto/${product.id}`} className="block">
        <div
          className="relative mb-4 aspect-[3/4] overflow-hidden rounded-sm bg-muted touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {product.images && product.images.length > 0 ? (
            <>
              {/* Renderiza todas as imagens */}
              {product.images.map((image, imgIndex) => (
                <Image
                  key={imgIndex}
                  src={image}
                  alt={`${product.name}${imgIndex > 0 ? ` - vista ${imgIndex + 1}` : ''}`}
                  fill
                  className={`object-cover transition-all duration-500 group-hover:scale-105 ${imgIndex === displayImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={imgIndex === 0}
                />
              ))}

              {/* Indicadores de imagem (mobile) */}
              {hasMultipleImages && (
                <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 md:hidden">
                  {product.images.map((_, imgIndex) => (
                    <div
                      key={imgIndex}
                      className={`h-1.5 w-1.5 rounded-full transition-all ${imgIndex === currentImageIndex
                          ? "w-4 bg-white"
                          : "bg-white/50"
                        }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/20 to-muted">
              <span className="text-sm text-muted-foreground">
                {product.name}
              </span>
            </div>
          )}

          {/* Overlay com contexto emocional */}
          <div className="absolute inset-0 z-10 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="text-sm font-light italic text-white">
              {emotionalContext}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-light tracking-wide transition-colors group-hover:text-muted-foreground">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {product.category}
          </p>
          <p className="text-lg font-light">
            R$ {product.price.toFixed(2)}
          </p>
        </div>
      </Link>
    </div>
  )
}

export function FeaturedCollectionSection({ products }: FeaturedCollectionSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const titleRef = useRef<HTMLDivElement>(null)

  // Conceitos emocionais para as peças
  const emotionalContext = [
    "A peça da decisão importante",
    "O look da confiança absoluta",
    "A escolha do momento especial",
    "A expressão da sua essência",
  ]

  // Número de produtos a mostrar por vez (responsivo)
  const [itemsPerView, setItemsPerView] = useState(4)

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: 1,
          },
        }
      )


    })

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const getItemsPerView = () => {
      if (window.innerWidth < 768) return 1
      if (window.innerWidth < 1024) return 2
      return 4
    }

    // Set initial value on mount
    setItemsPerView(getItemsPerView())

    const handleResize = () => {
      setItemsPerView(getItemsPerView())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, products.length - itemsPerView)

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const isMobile = itemsPerView === 1
      if (isMobile) {
        return Math.min(prev + 1, products.length - 1)
      }
      return Math.min(prev + 1, maxIndex)
    })
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  // Swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        goToNext()
      } else {
        goToPrev()
      }
    }
  }

  return (
    <section
      id="colecao"
      className="relative min-h-screen w-full overflow-hidden bg-muted/30 py-24 md:py-32 lg:py-40"
    >
      <div className="container mx-auto px-4">
        <div ref={titleRef} className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-light tracking-wide md:text-5xl lg:text-6xl">
            A Coleção
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            Peças pensadas para momentos que definem quem você é
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative mb-16">
          {/* Navigation Buttons - Desktop */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 z-20 hidden -translate-x-4 -translate-y-1/2 rounded-full bg-background/90 p-3 shadow-lg backdrop-blur-sm transition-all hover:bg-background hover:scale-110 md:flex"
              aria-label="Produto anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {currentIndex < maxIndex && (
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 z-20 hidden translate-x-4 -translate-y-1/2 rounded-full bg-background/90 p-3 shadow-lg backdrop-blur-sm transition-all hover:bg-background hover:scale-110 md:flex"
              aria-label="Próximo produto"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Carousel Track */}
          <div
            ref={carouselRef}
            className="overflow-visible md:overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: itemsPerView === 1
                  ? `translateX(calc(-${currentIndex * 80}% - ${currentIndex * 16}px + 10%))`
                  : `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 px-2 md:px-4"
                  style={{
                    width: itemsPerView === 1 ? '80%' : itemsPerView === 2 ? '50%' : '25%',
                  }}
                >
                  <ProductCard
                    product={product}
                    emotionalContext={emotionalContext[index % emotionalContext.length]}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Indicators - Mobile */}
          <div className="mt-8 flex justify-center gap-2 md:hidden">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${index === currentIndex ? "w-8 bg-foreground" : "w-2 bg-foreground/30"
                  }`}
                aria-label={`Ir para produto ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/catalogo">
            <Button
              size="lg"
              variant="outline"
              className="font-display group gap-2 text-base tracking-wider transition-all hover:gap-4"
            >
              EXPLORAR CATÁLOGO COMPLETO
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
