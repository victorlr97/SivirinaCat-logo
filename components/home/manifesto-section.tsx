"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function ManifestoSection() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const p1Ref = useRef<HTMLParagraphElement>(null)
  const p2Ref = useRef<HTMLParagraphElement>(null)
  const p3Ref = useRef<HTMLParagraphElement>(null)
  const p4Ref = useRef<HTMLParagraphElement>(null)

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
            markers: true,
          },
        }
      )

      // Stagger paragraphs
      const paragraphs = [p1Ref.current, p2Ref.current, p3Ref.current, p4Ref.current]
      
      paragraphs.forEach((p) => {
        gsap.fromTo(
          p,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: p,
              start: "top 80%",
              end: "bottom 20%",
              scrub: 1,
              markers: true,
            },
          }
        )
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="manifesto"
      className="relative min-h-screen w-full overflow-hidden bg-background py-24 md:py-32 lg:py-40"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            ref={titleRef}
            className="mb-12 text-4xl font-light leading-relaxed tracking-wide md:text-5xl lg:text-6xl"
          >
            Sou a mulher que se faz.
          </h2>

          <div className="space-y-8 text-lg font-light leading-relaxed text-muted-foreground md:text-xl lg:text-2xl">
            <p ref={p1Ref}>Decidida. Independente. Refinada.</p>
            <p ref={p2Ref}>Minhas escolhas não são acidentais.</p>
            <p ref={p3Ref}>
              Transito entre reuniões importantes e jantares memoráveis.
              <br />
              Entre o trabalho que construo e a vida que celebro.
            </p>
            <p
              ref={p4Ref}
              className="pt-8 text-2xl font-medium text-foreground md:text-3xl lg:text-4xl"
            >
              Sou clássica. Sou moderna. Sou Sivirina.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-1/2 h-px w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
    </section>
  )
}
