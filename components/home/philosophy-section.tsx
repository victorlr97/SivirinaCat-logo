import { Sparkles, Heart, Crown } from "lucide-react"

export function PhilosophySection() {
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

  return (
    <section
      id="filosofia"
      className="relative min-h-screen w-full overflow-hidden bg-background py-24 md:py-32 lg:py-40"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {/* Main philosophy statement */}
          <div className="mb-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
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
            {values.map((value, index) => (
              <div
                key={value.title}
                className="group text-center animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${600 + index * 200}ms` }}
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
            ))}
          </div>

          {/* Quote */}
          <div className="mt-20 border-l-2 border-foreground/10 pl-8 text-center animate-in fade-in duration-700 delay-[1400ms] md:text-left">
            <p className="mb-4 text-2xl font-light italic leading-relaxed text-muted-foreground md:text-3xl">
              "Visto Sivirina quando preciso lembrar quem eu sou."
            </p>
            <p className="text-sm tracking-wider text-muted-foreground/70">
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
