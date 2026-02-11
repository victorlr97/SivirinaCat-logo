"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowDown } from "lucide-react"
import { gsap } from "gsap"

export function HeroSection() {
  const logoRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Logo animation
      gsap.from(logoRef.current, {
        opacity: 0,
        duration: 2,
        y: 20,
      })

      // Subtitle animation
      gsap.from(subtitleRef.current, {
        opacity: 0,
        duration: 2,
        y: 20,
        delay: 0.2,
      })

      // CTA animation
      gsap.from(ctaRef.current, {
        opacity: 0,
        duration: 2,
        y: 20,
        delay: 0.4,
      })

      // Indicator animation
      gsap.from(indicatorRef.current, {
        opacity: 0,
        duration: 2,
        y: 20,
        delay: 0.6,
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      {/* Background image - você pode adicionar uma imagem de fundo aqui */}
      <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-10" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="max-w-4xl">
          <div ref={logoRef} className="mb-6 flex justify-center opacity-0">
            <Image
              src="/sivirina-logo.svg"
              alt="SIVIRINA"
              width={700}
              height={200}
              priority
              className="h-auto w-[280px] md:w-[500px] lg:w-[700px]"
            />
          </div>

          <p
            ref={subtitleRef}
            className="mb-12 text-xl font-light tracking-wide text-muted-foreground opacity-0 md:text-2xl lg:text-3xl"
          >
            Onde o clássico encontra o contemporâneo
          </p>

          <div ref={ctaRef} className="opacity-0">
            <Link
              href="#manifesto"
              className="font-display inline-flex items-center gap-2 text-sm font-medium tracking-wider transition-opacity hover:opacity-70"
            >
              DESCUBRA
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={indicatorRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0">
        <div className="h-12 w-px bg-gradient-to-b from-foreground/50 to-transparent" />
      </div>
    </section>
  )
}
