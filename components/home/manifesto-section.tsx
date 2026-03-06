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
  const closing1Ref = useRef<HTMLHeadingElement>(null)
  const closing2Ref = useRef<HTMLHeadingElement>(null)

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
            },
          }
        )
      })

        // Closing titles animation
        ;[closing1Ref.current, closing2Ref.current].forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
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
      id="manifesto"
      className="relative min-h-screen w-full overflow-hidden bg-background py-24 md:py-32 lg:py-40"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            ref={titleRef}
            className="mb-16 text-4xl font-light leading-relaxed tracking-wide md:text-5xl lg:text-6xl"
          >
            Sou uma marca viva.
          </h2>

          <div className="space-y-10 text-lg font-light leading-relaxed text-muted-foreground md:text-xl lg:text-2xl">
            <p ref={p1Ref}>Alto astral. Prática. Refinada. Especial.</p>
            <p ref={p2Ref}>
              Uso a moda ao meu favor presando pelo bem estar,<br className="hidden md:block" /> conformo e estilo de vida.
            </p>
            <p ref={p3Ref}>
              Rica de personalidade e de criatividade,<br className="hidden md:block" /> palavra essa que nos move todos os dias.
            </p>
            <p ref={p4Ref}>
              Sou uma marca de afeto, transito do clássico ao contemporâneo,<br className="hidden md:block" /> sou o que você quiser.
            </p>
          </div>

          <div className="mt-24 space-y-4">
            <p
              ref={closing1Ref}
              className="text-[2rem] font-medium leading-relaxed tracking-wide text-foreground"
            >
              Porque somos únicas. Somos Sivirina
            </p>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-1/2 h-px w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
    </section>
  )
}
