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
  const quoteRef = useRef<HTMLDivElement>(null)

  const values = [
    {
      icon: Crown,
      title: "Refinamento",
      description: "Cada detalhe é pensado. Cada costura, uma assinatura de qualidade.",
    },
    {
      icon: Heart,
      title: "Sentimento",
      description: "Não vendemos roupas. Materializamos a confiança, a elegância, o poder.",
    },
    {
      icon: Sparkles,
      title: "Atemporalidade",
      description: "Peças que transcendem estações. Clássicas hoje, clássicas sempre.",
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
          duration: 0.8,
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: true,
          },
        }
      )

      // Values stagger
      const valueRefs = [value1Ref.current, value2Ref.current, value3Ref.current]
      
      valueRefs.forEach((ref, index) => {
        gsap.fromTo(
          ref,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: 0.3 + index * 0.2,
            scrollTrigger: {
              trigger: ref,
              start: "top 80%",
              end: "bottom 20%",
              scrub: true,
            },
          }
        )
      })

      // Quote animation
      gsap.fromTo(
        quoteRef.current,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.5,
          scrollTrigger: {
            trigger: quoteRef.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: true,
          },
        }
      )
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
              Não vendemos roupas.
              <br />
              <span className="text-muted-foreground">
                Materializamos sentimentos.
              </span>
            </h2>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Cada peça Sivirina é criada para ser mais do que vestir.
              É a armadura para aquela reunião decisiva. O abraço de confiança
              antes de um momento importante. A declaração silenciosa de quem
              você é.
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

          {/* Quote */}
          <div ref={quoteRef} className="mt-20 border-l-2 border-foreground/10 pl-8 text-center md:text-left">
            <p className="mb-4 text-2xl font-light italic leading-relaxed text-muted-foreground md:text-3xl">
              "Visto Sivirina quando preciso lembrar quem eu sou."
            </p>
            <p className="font-display text-sm tracking-wider text-muted-foreground/70">
              — A MULHER SIVIRINA
            </p>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-1/2 h-px w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
    </section>
  )
}
