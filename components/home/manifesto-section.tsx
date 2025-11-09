export function ManifestoSection() {
  return (
    <section
      id="manifesto"
      className="relative min-h-screen w-full overflow-hidden bg-background py-24 md:py-32 lg:py-40"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="mb-12 text-4xl font-light leading-relaxed tracking-wide md:text-5xl lg:text-6xl">
            Sou a mulher que se faz.
          </h2>

          <div className="space-y-8 text-lg font-light leading-relaxed text-muted-foreground md:text-xl lg:text-2xl">
            <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Decidida. Independente. Refinada.
            </p>
            <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Minhas escolhas não são acidentais.
            </p>
            <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              Transito entre reuniões importantes e jantares memoráveis.
              <br />
              Entre o trabalho que construo e a vida que celebro.
            </p>
            <p className="pt-8 text-2xl font-medium text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 md:text-3xl lg:text-4xl">
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
