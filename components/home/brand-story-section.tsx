export function BrandStorySection() {
  return (
    <section
      id="historia"
      className="relative min-h-screen w-full overflow-hidden bg-muted/30 py-24 md:py-32 lg:py-40"
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image side */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted animate-in fade-in slide-in-from-left-8 duration-700">
            {/* Placeholder - adicione uma imagem real aqui */}
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/20 to-muted">
              <span className="text-sm text-muted-foreground">
                Imagem da história da marca
              </span>
            </div>
          </div>

          {/* Content side */}
          <div className="flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <h2 className="text-4xl font-light tracking-wide md:text-5xl lg:text-6xl">
              Nossa História
            </h2>

            <div className="space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>
                Sivirina nasceu da observação de uma mulher contemporânea: aquela
                que constrói sua própria narrativa, que se recusa a escolher entre
                profissional e feminina, entre clássica e atual.
              </p>

              <p>
                Cada peça é pensada para a mulher que sabe exatamente quem é.
                Que valoriza a qualidade, a atemporalidade e o refinamento.
                Que entende moda como expressão, não como imposição.
              </p>

              <p>
                Não criamos tendências passageiras. Construímos um guarda-roupa
                que atravessa estações, que acompanha conquistas, que testemunha
                momentos importantes.
              </p>

              <p className="pt-4 text-lg font-medium text-foreground md:text-xl">
                Sivirina é para a mulher que se veste para si mesma.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="space-y-2 animate-in fade-in zoom-in-50 duration-500 delay-500">
                <p className="text-3xl font-light">2020</p>
                <p className="text-sm text-muted-foreground">Fundação</p>
              </div>
              <div className="space-y-2 animate-in fade-in zoom-in-50 duration-500 delay-700">
                <p className="text-3xl font-light">∞</p>
                <p className="text-sm text-muted-foreground">Atemporalidade</p>
              </div>
              <div className="space-y-2 animate-in fade-in zoom-in-50 duration-500 delay-1000">
                <p className="text-3xl font-light">100%</p>
                <p className="text-sm text-muted-foreground">Autenticidade</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
