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
            <img
              src="https://avbqlvwld8wfjalv.public.blob.vercel-storage.com/brand-story/IMG_8391.webp"
              alt="Tecido branco com botões artesanais e carretel de linha mostarda, representando o artesanato da marca Sivirina"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Content side */}
          <div className="flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <h2 className="text-4xl font-light tracking-wide md:text-5xl lg:text-6xl">
              Nossa História
            </h2>

            <div className="space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>
                Nasci para atender as demandas das mulheres contemporâneas, que em meio às rotinas corridas e diversas querem se sentir bem, elegantes e especiais.
              </p>

              <p>
                Com todo o cuidado na seleção das modelagens, tecidos e acabamentos, trago os detalhes: desde os croquis aos bordados, tudo pensado e feito artesanalmente. Com o apoio de bordadeiras locais do interior de Minas Gerais e inspirações da natureza onde surgi, na fazenda em Carlos Alves - MG, tudo se encaixa para produzir peças selecionadas e com a exclusividade que cada Sivirina merece.
              </p>

              <p>
                Prezo muito pelo conforto, atemporalidade e versatilidade de minhas peças, afinal a moda consciente, como forma de expressão e cheia de personalidade é o que quero poder proporcionar.
              </p>

              <p>
                Não criamos tendências passageiras, mas sim construímos coleções que atravessam estações e renascem a cada forma de usar.
              </p>

            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
              <div className="flex flex-col items-center text-center space-y-1 animate-in fade-in zoom-in-50 duration-500 delay-500">
                <p className="text-2xl font-light md:text-3xl">2020</p>
                <p className="text-xs text-muted-foreground md:text-sm">Fundação</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-1 animate-in fade-in zoom-in-50 duration-500 delay-700 border-x border-border">
                <p className="text-2xl font-light md:text-3xl">∞</p>
                <p className="text-xs text-muted-foreground md:text-sm">Atemporalidade</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-1 animate-in fade-in zoom-in-50 duration-500 delay-1000">
                <p className="text-2xl font-light md:text-3xl">100%</p>
                <p className="text-xs text-muted-foreground md:text-sm">Autenticidade</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
