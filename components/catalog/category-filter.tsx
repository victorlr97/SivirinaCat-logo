"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Menu, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CategoryFilterProps {
  categories: string[]
  searchQuery?: string
  onSearchChange?: (value: string) => void
}

export function CategoryFilter({ categories, searchQuery = "", onSearchChange }: CategoryFilterProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentCategory = searchParams.get("categoria")
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus()
    }
  }, [searchOpen])

  const handleOpenSearch = () => {
    setSearchOpen(true)
  }

  const handleCloseSearch = () => {
    setSearchOpen(false)
    onSearchChange?.("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleCloseSearch()
    }
  }

  const handleTodosClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    router.push("/catalogo")
    router.refresh()
  }

  const CategoryLinks = () => (
    <>
      <Link
        href="/catalogo"
        className={`px-4 py-2 text-sm transition-colors hover:text-foreground ${
          !currentCategory ? "font-medium text-foreground" : "text-muted-foreground"
        }`}
        onClick={handleTodosClick}
      >
        Todos
      </Link>
      {categories.map((category) => (
        <Link
          key={category}
          href={`/catalogo?categoria=${encodeURIComponent(category)}`}
          className={`px-4 py-2 text-sm transition-colors hover:text-foreground ${
            currentCategory === category ? "font-medium text-foreground" : "text-muted-foreground"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        >
          {category}
        </Link>
      ))}
    </>
  )

  if (categories.length === 0) {
    return null
  }

  return (
    <div
      className={`sticky top-12 z-40 border-b border-border bg-background/95 backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-background/60 md:top-14 ${scrolled ? "" : ""}`}
    >
      <div className="container mx-auto px-4">
        {/* Desktop: Horizontal bar */}
        <nav
          className={`hidden items-center justify-between gap-2 transition-all duration-300 md:flex ${scrolled ? "py-2" : "py-4"}`}
        >
          {/* Categorias — some quando busca está aberta */}
          <div
            className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
              searchOpen ? "w-0 opacity-0 pointer-events-none" : "w-full opacity-100"
            }`}
          >
            <CategoryLinks />
          </div>

          {/* Campo de busca expansível */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center overflow-hidden rounded-full border border-border bg-background transition-all duration-300 ease-in-out ${
                searchOpen ? "w-64 px-3" : "w-0 px-0 border-transparent"
              }`}
            >
              <input
                ref={inputRef}
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
        </nav>

        {/* Mobile: Hamburger menu */}
        <div
          className={`flex items-center justify-between transition-all duration-300 md:hidden ${scrolled ? "py-1" : "py-2"}`}
        >
          {searchOpen ? (
            <div className="flex flex-1 items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nome, código ou preço..."
                className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button variant="ghost" size="icon" onClick={handleCloseSearch} aria-label="Fechar busca">
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <span className="text-sm font-medium">{currentCategory || "Todas as Categorias"}</span>
              <Button variant="ghost" size="icon" onClick={handleOpenSearch} aria-label="Abrir busca">
                <Search className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
