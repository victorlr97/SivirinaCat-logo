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

interface CatalogHeaderProps {
  categories?: string[]
}

export function CatalogHeader({ categories = [] }: CatalogHeaderProps) {
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

  const CategoryLinks = () => (
    <>
      <Link
        href="/"
        className={`text-sm transition-colors hover:text-foreground ${
          scrolled ? "px-3 py-1" : "px-4 py-2"
        } ${!currentCategory ? "font-medium text-foreground" : "text-muted-foreground"}`}
        onClick={handleTodosClick}
      >
        Todos
      </Link>
      {categories.map((category) => (
        <Link
          key={category}
          href={`/?categoria=${encodeURIComponent(category)}`}
          className={`text-sm transition-colors hover:text-foreground ${
            scrolled ? "px-3 py-1" : "px-4 py-2"
          } ${currentCategory === category ? "font-medium text-foreground" : "text-muted-foreground"}`}
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
            scrolled ? "h-10 md:h-12" : "h-20 md:h-24"
          }`}
        >
          {/* Logo - Fixed to left */}
          <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-70">
            <Image
              src="/images/design-mode/SIVIRINA%20LOGO.png"
              alt="SIVIRINA"
              width={60}
              height={45}
              className={`w-auto transition-all duration-300 ${scrolled ? "h-3 md:h-5" : "h-5 md:h-10"}`}
              priority
            />
          </Link>

          {/* Categories - Centered on desktop */}
          {categories.length > 0 && (
            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex">
              <CategoryLinks />
            </nav>
          )}

          {/* Mobile menu - Right side */}
          {categories.length > 0 && (
            <div className="ml-auto md:hidden">
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
        </div>
      </div>
    </header>
  )
}
