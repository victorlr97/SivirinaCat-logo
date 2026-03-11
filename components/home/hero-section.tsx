"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowDown } from "lucide-react"

export function HeroSection() {

  return (
    <section className="relative h-screen w-full overflow-hidden bg-background">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://avbqlvwld8wfjalv.public.blob.vercel-storage.com/hero/foto_bg.webp')",
          opacity: 0.6,
        }}
      />
      {/* Gradient overlay para continuidade com o site */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="max-w-4xl">
          <div className="mb-6 flex justify-center">
            <Image
              src="/sivirina-logo.svg"
              alt="SIVIRINA"
              width={700}
              height={200}
              priority
              className="h-auto w-[280px] md:w-[500px] lg:w-[700px]"
            />
          </div>

          <p className="mb-12 text-xl font-light tracking-wide text-muted-foreground md:text-2xl lg:text-3xl">
            Viva a sua personalidade
          </p>

          <div>
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="h-12 w-px bg-gradient-to-b from-foreground/50 to-transparent" />
      </div>
    </section>
  )
}
