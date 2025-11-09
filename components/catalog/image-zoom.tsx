"use client"

import { useState, useRef, MouseEvent } from "react"
import Image from "next/image"

interface ImageZoomProps {
  src: string
  alt: string
  zoomScale?: number
}

export function ImageZoom({ src, alt, zoomScale = 2.5 }: ImageZoomProps) {
  const [isZooming, setIsZooming] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setPosition({ x, y })
  }

  const handleMouseEnter = () => {
    setIsZooming(true)
  }

  const handleMouseLeave = () => {
    setIsZooming(false)
  }

  return (
    <div className="relative h-full w-full">
      {/* Imagem principal */}
      <div
        ref={imageRef}
        className="relative h-full w-full cursor-crosshair overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Círculo de zoom FORA da imagem (desktop only) */}
      {isZooming && (
        <div className="pointer-events-none absolute -right-2 top-0 hidden h-96 w-96 translate-x-full md:block">
          <div
            className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-background shadow-2xl"
            style={{
              background: `url(${src}) no-repeat`,
              backgroundPosition: `${position.x}% ${position.y}%`,
              backgroundSize: `${zoomScale * 100}%`,
            }}
          />

          {/* Indicador de posição */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
            Zoom {zoomScale}x
          </div>
        </div>
      )}
    </div>
  )
}
