"use client"

import { useEffect, useRef } from "react"
import { Sparkles, Heart, Crown } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function PhilosophySection() {
  const titleRef = useRef<HTMLDivElement>(null)
  const value1Ref = useRef<HTMLDivElement>(null)
  const value2Ref = useRef<HTMLDivElement>(null)
  const value3Ref = useRef<HTMLDivElement>(null)

  const values = [
    {
      icon: Crown,
      title: "Detalhes",
      description: "Idealizados com carinho, artesanalmente e cheios de significado.",
    },
    {
      icon: Heart,
      title: "Sentimento",
      description: "Histórias, pessoas, valores e amor por cada peça produzida.",
    },
    {
      icon: Sparkles,
      title: "Atemporalidade",
      description: "Confeccionar peças que transcendem estações é a nossa missão.",
    },
  ]

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

      // Values stagger
      const valueRefs = [value1Ref.current, value2Ref.current, value3Ref.current]

      valueRefs.forEach((ref) => {
        gsap.fromTo(
          ref,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ref,
              start: "top 80%",
              end: "bottom 20%",
              scrub: 1,
            },
          }
        )
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="filosofia"
      className="relative min-h-screen w-full overflow-hidden bg-background py-24 md:py-32 lg:py-40"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {/* Main philosophy statement */}
          <div ref={titleRef} className="mb-20 text-center">
            <h2 className="mb-8 text-4xl font-light leading-tight tracking-wide md:text-5xl lg:text-6xl">
              Ofereço mais que roupas.
              <br />
              <span className="text-muted-foreground">
                Proporciono sentimento.
              </span>
            </h2>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Ofereço artesanato, história, um pedacinho da natureza e um pedacinho da dedicação exclusiva de pessoas incríveis que ali, manualmente, todos os dias se empenham para me tornar uma peça linda e cheia de significado.
            </p>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Sou cuidado, detalhe e sentimento em cada etapa da produção.
            </p>
          </div>

          {/* Values grid */}
          <div className="grid gap-12 md:grid-cols-3">
            {values.map((value, index) => {
              const ref = index === 0 ? value1Ref : index === 1 ? value2Ref : value3Ref
              return (
                <div
                  key={value.title}
                  ref={ref}
                  className="group text-center"
                >
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-sm bg-muted transition-colors group-hover:bg-accent/20">
                    <value.icon className="h-8 w-8 text-foreground/70" strokeWidth={1.5} />
                  </div>

                  <h3 className="mb-4 text-2xl font-light tracking-wide">
                    {value.title}
                  </h3>

                  <p className="leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-1/2 h-px w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
    </section>
  )
}
