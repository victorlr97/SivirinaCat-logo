"use client"

import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { LogOut, User } from 'lucide-react'

export function CatalogHeader() {
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

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-background/60">
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

            {/* Hamburguer Menu - Right */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
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
                className={`transition-opacity hover:opacity-70 ${pathname === '/' ? 'font-medium' : 'font-light text-muted-foreground'}`}
              >
                HOME
              </Link>
              <Link
                href="/catalogo"
                className={`transition-opacity hover:opacity-70 ${pathname === '/catalogo' ? 'font-medium' : 'font-light text-muted-foreground'}`}
              >
                CATÁLOGO
              </Link>
            </nav>

            {/* Right Spacer */}
            <div className="w-24" />
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <nav className="font-display flex flex-col gap-4 border-t border-border py-4 sm:hidden">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-center text-sm tracking-wider transition-opacity hover:opacity-70 ${pathname === '/' ? 'font-medium' : 'font-light text-muted-foreground'}`}
            >
              HOME
            </Link>
            <Link
              href="/catalogo"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-center text-sm tracking-wider transition-opacity hover:opacity-70 ${pathname === '/catalogo' ? 'font-medium' : 'font-light text-muted-foreground'}`}
            >
              CATÁLOGO
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
