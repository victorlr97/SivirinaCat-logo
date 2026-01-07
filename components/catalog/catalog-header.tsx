"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Menu, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"

interface CatalogHeaderProps {
  categories?: string[]
  onSearch?: (term: string) => void
}

export function CatalogHeader({ categories = [], onSearch }: CatalogHeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("categoria")

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

  const handleTodosClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen)
    if (searchOpen) {
      setSearchTerm("")
      onSearch?.("")
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch?.(value)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false)
      setSearchTerm("")
      onSearch?.("")
    }
  }

  const CategoryLinks = () => (
    <>
      <Link
        href="/"
        className={`text-sm transition-colors hover:text-foreground px-3 py-1 ${!currentCategory ? "font-medium text-foreground" : "text-muted-foreground"}`}
        onClick={handleTodosClick}
      >
        Todos
      </Link>
      {categories.map((category) => (
        <Link
          key={category}
          href={`/?categoria=${encodeURIComponent(category)}`}
          className={`text-sm transition-colors hover:text-foreground px-3 py-1 ${currentCategory === category ? "font-medium text-foreground" : "text-muted-foreground"}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          {category}
        </Link>
      ))}
    </>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-10 md:h-12">
          <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-70">
            <Image
              src="/images/sivirina-20logo.png"
              alt="SIVIRINA"
              width={60}
              height={45}
              className="w-auto h-3 md:h-5"
              priority
            />
          </Link>

          {categories.length > 0 && !searchOpen && (
            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex">
              <CategoryLinks />
            </nav>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleSearchToggle} className="h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>

            {categories.length > 0 && (
              <div className="md:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="absolute inset-0 z-50 bg-background/98 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 h-10 md:h-12">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={handleSearchToggle} className="h-8 w-8 flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
