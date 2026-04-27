"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ClearSessionPage() {
  const [cleared, setCleared] = useState(false)
  const router = useRouter()

  const clearSession = async () => {
    await fetch("/api/auth/session", { method: "DELETE" })
    setCleared(true)
  }

  useEffect(() => {
    clearSession()
  }, [])

  const handleContinue = () => {
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sessão Inválida Detectada</CardTitle>
          <CardDescription>
            {cleared ? "Sua sessão foi limpa com sucesso." : "Detectamos uma sessão inválida que precisa ser limpa."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cleared ? (
            <>
              <p className="text-sm text-muted-foreground">
                A sessão inválida foi removida. Você pode continuar navegando normalmente.
              </p>
              <Button onClick={handleContinue} className="w-full">
                Continuar para Home
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Isso geralmente acontece quando uma conta foi deletada mas o navegador ainda tem dados antigos salvos.
              </p>
              <Button onClick={clearSession} className="w-full">
                Limpar Sessão
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
