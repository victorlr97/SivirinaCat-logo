import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-background py-24 md:py-32 lg:py-40">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="mb-8 text-4xl font-light leading-tight tracking-wide md:text-5xl lg:text-6xl">
            Descubra sua Sivirina
          </h2>

          <p className="mb-12 text-lg leading-relaxed text-muted-foreground md:text-xl lg:text-2xl">
            Cada peça espera por alguém que compreenda seu valor.
            <br />
            Talvez essa pessoa seja você.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-700 delay-300 sm:flex-row">
            <Link href="/catalogo">
              <Button
                size="lg"
                className="min-w-[200px] text-base tracking-wider"
              >
                VER COLEÇÃO
              </Button>
            </Link>

            <Link
              href="https://instagram.com/sivirina"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="min-w-[200px] gap-2 text-base tracking-wider"
              >
                <Instagram className="h-4 w-4" />
                INSTAGRAM
              </Button>
            </Link>
          </div>

          {/* Decorative quote */}
          <div className="mt-20 border-t border-foreground/10 pt-12 animate-in fade-in duration-700 delay-600">
            <p className="text-sm font-light italic tracking-wider text-muted-foreground">
              "Para mulheres que se vestem para si mesmas"
            </p>
          </div>
        </div>
      </div>

      {/* Background decorative element */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-muted/50 via-transparent to-transparent" />
    </section>
  )
}
