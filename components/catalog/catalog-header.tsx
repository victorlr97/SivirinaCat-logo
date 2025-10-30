import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CatalogHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between md:h-24">
          <div className="w-24" />

          <Link href="/" className="transition-opacity hover:opacity-70">
            <Image
              src="/images/design-mode/SIVIRINA%20LOGO.png"
              alt="SIVIRINA"
              width={180}
              height={40}
              className="h-8 w-auto md:h-[135px]"
              priority
            />
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
