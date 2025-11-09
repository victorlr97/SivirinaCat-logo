"use client"

import Link from "next/link"
import { ArrowDown } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      {/* Background image - você pode adicionar uma imagem de fundo aqui */}
      <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-10" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="mb-6 text-6xl font-light tracking-[0.2em] md:text-8xl lg:text-9xl">
            SIVIRINA
          </h1>

          <p className="mb-12 text-xl font-light tracking-wide text-muted-foreground animate-in fade-in duration-1000 delay-500 md:text-2xl lg:text-3xl">
            Onde o clássico encontra o contemporâneo
          </p>

          <div className="animate-in fade-in duration-1000 delay-1000">
            <Link
              href="#manifesto"
              className="inline-flex items-center gap-2 text-sm font-medium tracking-wider transition-opacity hover:opacity-70"
            >
              DESCUBRA
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-in fade-in duration-1000 delay-[1500ms]">
        <div className="h-12 w-px bg-gradient-to-b from-foreground/50 to-transparent" />
      </div>
    </section>
  )
}
