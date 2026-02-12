"use client"

import { useRouter, usePathname } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function AdminHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    })
    router.push("/admin")
    router.refresh()
  }

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Produtos", href: "/admin/produtos" },
    { name: "Clientes", href: "/admin/clientes" },
    { name: "Vendas", href: "/admin/vendas" }, // Added Vendas navigation item
  ]

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Image 
            src="/sivirina-logo.svg" 
            alt="SIVIRINA" 
            width={120} 
            height={40}
          />
          <span className="text-sm text-muted-foreground">Admin</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 max-w-7xl">
          <nav className="flex gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "py-3 text-sm font-medium border-b-2 transition-colors",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50",
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
