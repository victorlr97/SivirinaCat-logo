"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { LogOut, User } from 'lucide-react'

interface CatalogHeaderProps {
  categories: string[]
}

export function CatalogHeader({ categories }: CatalogHeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUserName(null)
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

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? "h-14 md:h-16" : "h-20 md:h-24"
          }`}
        >
          <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-70">
            <Image
              src="/images/sivirina-20logo.png"
              alt="SIVIRINA"
              width={120}
              height={90}
              className={`w-auto transition-all duration-300 ${scrolled ? "h-5 md:h-10" : "h-8 md:h-16"}`}
              priority
            />
          </Link>

          {categories.length > 0 && (
            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex">
              <CategoryLinks />
            </nav>
          )}

          {categories.length > 0 && (
            <div className="md:hidden">
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
          )}

          {/* <div className="flex items-center gap-2">
            {!isLoggedIn ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Entrar</Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <User className="h-4 w-4" />
                    {userName || "Perfil"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div> */}

          <div className="w-24 md:w-0" />
        </div>
      </div>
    </header>
  )
}
