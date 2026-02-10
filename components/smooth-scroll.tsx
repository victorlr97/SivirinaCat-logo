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

    // Create ScrollSmoother instance
    smoother.current = ScrollSmoother.create({
      smooth: 1.5,
      effects: true,
      normalizeScroll: false,
    })

    console.log("[v0] ScrollSmoother initialized with smooth: 1.5")

    // Cleanup
    return () => {
      smoother.current?.kill()
      console.log("[v0] ScrollSmoother destroyed")
    }
  }, [])

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  )
}
