"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowDown } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      {/* Background image - você pode adicionar uma imagem de fundo aqui */}
      <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-10" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mb-6 flex justify-center">
            <Image
              src="/sivirina-logo.svg"
              alt="SIVIRINA"
              width={700}
              height={200}
              priority
              className="w-[280px] md:w-[500px] lg:w-[700px] h-auto"
            />
          </div>

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
