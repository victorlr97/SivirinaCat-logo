"use client"

import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AdminHeader() {
  const router = useRouter()
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

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-light tracking-wide">SIVIRINA</h1>
          <span className="text-sm text-muted-foreground">Admin</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  )
}
