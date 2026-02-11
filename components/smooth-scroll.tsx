"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollSmoother, ScrollTrigger)
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const smoother = useRef<ScrollSmoother | null>(null)

  useLayoutEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Detectar se é desktop (768px ou maior - breakpoint md do Tailwind)
    const isDesktop = window.matchMedia("(min-width: 768px)").matches

    // Só criar ScrollSmoother em desktop
    if (isDesktop) {
      smoother.current = ScrollSmoother.create({
        smooth: 1.5,
        effects: true,
        normalizeScroll: true,
      })
      console.log("[v0] ScrollSmoother ativado (Desktop)")
    } else {
      console.log("[v0] ScrollSmoother desabilitado (Mobile - usando scroll nativo)")
    }

    // Cleanup
    return () => {
      smoother.current?.kill()
    }
  }, [])

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  )
}
