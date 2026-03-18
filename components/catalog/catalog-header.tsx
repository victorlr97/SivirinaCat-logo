"use client"

import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { LogOut, User } from 'lucide-react'

interface CatalogHeaderProps {
  categories?: string[]
}

export function CatalogHeader({ categories = [] }: CatalogHeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setIsLoggedIn(true)

        // Get user name from clientes table
        const { data: clientData } = await supabase.from("clientes").select("nome").eq("user_id", user.id).single()

        if (clientData) {
          setUserName(clientData.nome)
        }
      } else {
        setIsLoggedIn(false)
        setUserName(null)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUser()
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUserName(null)
    router.push("/")
    router.refresh()
  }

  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("categoria")

  return (
    <header className="z-50 border-b border-border bg-background/95 backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="relative flex h-14 items-center justify-between">
          {/* Mobile Layout (< 441px) */}
          <div className="flex w-full items-center justify-between sm:hidden">
            {/* Logo Centered */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 transition-opacity hover:opacity-70">
              <Image
                src="/sivirina-logo.svg"
                alt="SIVIRINA"
                width={120}
                height={30}
                className="h-6 w-auto"
                priority
              />
            </Link>

            {/* Menu unificado - Right */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <SheetContent side="right" className="w-[280px]">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">Navegação e categorias do catálogo</SheetDescription>
                <div className="flex flex-col gap-6 pt-8">
                  {/* Navegação */}
                  <div>
                    <p className="mb-2 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Navegação
                    </p>
                    <nav className="font-display flex flex-col">
                      <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-4 py-2 text-sm tracking-wider transition-opacity hover:opacity-70 ${pathname === "/" ? "font-medium" : "font-light text-muted-foreground"}`}
                      >
                        HOME
                      </Link>
                      <Link
                        href="/catalogo"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-4 py-2 text-sm tracking-wider transition-opacity hover:opacity-70 ${pathname === "/catalogo" ? "font-medium" : "font-light text-muted-foreground"}`}
                      >
                        CATÁLOGO
                      </Link>
                    </nav>
                  </div>

                  {/* Categorias */}
                  {categories.length > 0 && (
                    <div>
                      <p className="mb-2 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        Categorias
                      </p>
                      <div className="flex flex-col">
                        <Link
                          href="/catalogo"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`px-4 py-2 text-sm transition-colors hover:text-foreground ${!currentCategory ? "font-medium text-foreground" : "text-muted-foreground"}`}
                        >
                          Todos
                        </Link>
                        {categories.map((cat) => (
                          <Link
                            key={cat}
                            href={`/catalogo?categoria=${encodeURIComponent(cat)}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`px-4 py-2 text-sm transition-colors hover:text-foreground ${currentCategory === cat ? "font-medium text-foreground" : "text-muted-foreground"}`}
                          >
                            {cat}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Layout (≥ 441px) */}
          <div className="hidden w-full items-center justify-between sm:flex">
            {/* Logo - Left */}
            <Link href="/" className="transition-opacity hover:opacity-70">
              <Image
                src="/sivirina-logo.svg"
                alt="SIVIRINA"
                width={120}
                height={30}
                className="h-6 w-auto"
                priority
              />
            </Link>

            {/* Navigation Links - Center */}
            <nav className="font-display absolute left-1/2 flex -translate-x-1/2 items-center gap-6 text-sm tracking-wider">
              <Link
                href="/"
                className={`transition-opacity hover:opacity-70 ${pathname === "/" ? "font-medium" : "font-light text-muted-foreground"}`}
              >
                HOME
              </Link>
              <Link
                href="/catalogo"
                className={`transition-opacity hover:opacity-70 ${pathname === "/catalogo" ? "font-medium" : "font-light text-muted-foreground"}`}
              >
                CATÁLOGO
              </Link>
            </nav>

            {/* Right Spacer */}
            <div className="w-24" />
          </div>
        </div>
      </div>
    </header>
  )
}
