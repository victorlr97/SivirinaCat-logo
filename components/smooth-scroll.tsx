"use client"

import { useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Simple smooth scroll with CSS
    const style = document.createElement("style")
    style.textContent = `
      html {
        scroll-behavior: smooth;
      }
    `
    document.head.appendChild(style)

    console.log("[v0] Smooth scroll enabled with CSS")

    // Cleanup
    return () => {
      document.head.removeChild(style)
      console.log("[v0] Smooth scroll removed")
    }
  }, [])

  return <>{children}</>
}
