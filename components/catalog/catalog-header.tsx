"use client"

import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { LogOut, User } from 'lucide-react'

export function CatalogHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
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

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div
          className={`relative flex items-center justify-between transition-all duration-300 ${
            scrolled ? "h-12 md:h-14" : "h-20 md:h-24"
          }`}
        >
          {/* Logo - Left */}
          <Link href="/" className="transition-opacity hover:opacity-70">
            <Image
              src="/sivirina-logo.svg"
              alt="SIVIRINA"
              width={120}
              height={30}
              className={`w-auto transition-all duration-300 ${scrolled ? "h-5 md:h-6" : "h-6 md:h-8"}`}
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
    </header>
  )
}
