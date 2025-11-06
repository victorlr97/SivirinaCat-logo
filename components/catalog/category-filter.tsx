"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface CategoryFilterProps {
  categories: string[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentCategory = searchParams.get("categoria")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleTodosClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  const CategoryLinks = () => (
    <>
      <Link
        href="/"
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
          href={`/?categoria=${encodeURIComponent(category)}`}
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
          className={`hidden items-center justify-center gap-2 transition-all duration-300 md:flex ${scrolled ? "py-2" : "py-4"}`}
        >
          <CategoryLinks />
        </nav>

        {/* Mobile: Hamburger menu */}
        <div
          className={`flex items-center justify-between transition-all duration-300 md:hidden ${scrolled ? "py-1" : "py-2"}`}
        >
          <span className="text-sm font-medium">{currentCategory || "Todas as Categorias"}</span>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-1 pt-8">
                <CategoryLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
