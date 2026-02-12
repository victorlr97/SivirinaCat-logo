import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/admin/login-form"
import Image from "next/image"

export default async function AdminLoginPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Se já estiver autenticado, redireciona para o dashboard
  if (user) {
    redirect("/admin/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="/sivirina-logo.svg" 
              alt="SIVIRINA" 
              width={180} 
              height={60}
              priority
            />
          </div>
          <p className="text-sm text-muted-foreground">Painel Administrativo</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
