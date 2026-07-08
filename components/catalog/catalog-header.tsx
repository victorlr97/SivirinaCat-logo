"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { onAuthStateChanged } from "firebase/auth"
import { auth, signOut } from "@/lib/firebase/auth"
import { useEffect, useRef, useState, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Menu, Search, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { CartSheet } from "@/components/cart/cart-sheet"
import { useCart } from "@/lib/cart-context"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { LogOut, User } from 'lucide-react'

interface CatalogHeaderProps {
  categories?: string[]
  searchQuery?: string
  onSearchChange?: (value: string) => void
}

function CartTrigger({ itemCount, onClick }: { itemCount: number; onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label="Abrir carrinho" className="relative">
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
          {itemCount}
        </span>
      )}
    </Button>
  )
}

function CatalogHeaderInner({ categories = [], searchQuery = "", onSearchChange }: CatalogHeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { itemCount } = useCart()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
        setUserName(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signOut()
    setIsLoggedIn(false)
    setUserName(null)
    router.push("/")
    router.refresh()
  }

  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("categoria")

  const handleOpenSearch = () => {
    setSearchOpen(true)
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }

  const handleCloseSearch = () => {
    setSearchOpen(false)
    onSearchChange?.("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") handleCloseSearch()
  }

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

            {/* Carrinho + Menu unificado - Right */}
            <div className="ml-auto flex items-center gap-1">
              <CartTrigger itemCount={itemCount} onClick={() => setCartOpen(true)} />

              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Abrir menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <SheetContent side="right" className="w-[280px] px-0">
                <SheetHeader className="px-6 pb-4 pt-6">
                  <SheetTitle className="text-base font-medium tracking-wide">Menu</SheetTitle>
                  <SheetDescription className="sr-only">Navegação e categorias do catálogo</SheetDescription>
                </SheetHeader>

                <Separator />

                <div className="flex flex-col gap-1 py-4">
                  {/* Navegação */}
                  <p className="px-6 pb-1 pt-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Navegação
                  </p>
                  <nav className="flex flex-col">
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`border-l-2 px-6 py-3 text-sm transition-all hover:bg-muted ${
                        pathname === "/"
                          ? "border-foreground font-medium text-foreground"
                          : "border-transparent font-light text-muted-foreground"
                      }`}
                    >
                      Home
                    </Link>
                    <Link
                      href="/catalogo"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`border-l-2 px-6 py-3 text-sm transition-all hover:bg-muted ${
                        pathname === "/catalogo"
                          ? "border-foreground font-medium text-foreground"
                          : "border-transparent font-light text-muted-foreground"
                      }`}
                    >
                      Catálogo
                    </Link>
                  </nav>
                </div>

                {categories.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-1 py-4">
                      <p className="px-6 pb-1 pt-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        Categorias
                      </p>
                      <div className="flex flex-col">
                        <Link
                          href="/catalogo"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`border-l-2 px-6 py-3 text-sm transition-all hover:bg-muted ${
                            !currentCategory
                              ? "border-foreground font-medium text-foreground"
                              : "border-transparent text-muted-foreground"
                          }`}
                        >
                          Todos
                        </Link>
                        {categories.map((cat) => (
                          <Link
                            key={cat}
                            href={`/catalogo?categoria=${encodeURIComponent(cat)}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`border-l-2 px-6 py-3 text-sm transition-all hover:bg-muted ${
                              currentCategory === cat
                                ? "border-foreground font-medium text-foreground"
                                : "border-transparent text-muted-foreground"
                            }`}
                          >
                            {cat}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </SheetContent>
              </Sheet>
            </div>
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

            {/* Lupa + Carrinho - Right */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1" style={{ visibility: onSearchChange ? "visible" : "hidden" }}>
                <div
                  className={`flex items-center overflow-hidden rounded-full border border-border bg-background transition-all duration-300 ease-in-out ${
                    searchOpen ? "w-56 px-3" : "w-0 border-transparent px-0"
                  }`}
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nome, código ou preço..."
                    className="w-full bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                {searchOpen ? (
                  <Button variant="ghost" size="icon" onClick={handleCloseSearch} aria-label="Fechar busca">
                    <X className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={handleOpenSearch} aria-label="Abrir busca">
                    <Search className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <CartTrigger itemCount={itemCount} onClick={() => setCartOpen(true)} />
            </div>
          </div>
        </div>
      </div>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  )
}

export function CatalogHeader(props: CatalogHeaderProps) {
  return (
    <Suspense fallback={<div className="h-14 border-b bg-background" />}>
      <CatalogHeaderInner {...props} />
    </Suspense>
  )
}
