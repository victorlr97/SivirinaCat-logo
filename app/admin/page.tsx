import { LoginForm } from "@/components/admin/login-form"
import Image from "next/image"

export default async function AdminLoginPage() {
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
              className="h-auto w-[180px]"
            />
          </div>
          <p className="text-sm text-muted-foreground">Painel Administrativo</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
