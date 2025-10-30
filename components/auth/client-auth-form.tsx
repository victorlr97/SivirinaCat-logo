"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

type Step = "email" | "login" | "create-password" | "additional-info"
type EmailStatus = "has-password" | "no-password" | "new"

export function ClientAuthForm() {
  const [step, setStep] = useState<Step>("email")
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null)
  const [existingClientId, setExistingClientId] = useState<string | null>(null)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const [nome, setNome] = useState("")
  const [cpf, setCpf] = useState("")
  const [telefone, setTelefone] = useState("")
  const [rua, setRua] = useState("")
  const [numero, setNumero] = useState("")
  const [complemento, setComplemento] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")
  const [cep, setCep] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [cepLoading, setCepLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleCepChange = async (value: string) => {
    const cleanCep = value.replace(/\D/g, "")
    setCep(cleanCep)

    if (cleanCep.length === 8) {
      setCepLoading(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await response.json()

        if (data.erro) {
          toast({
            title: "CEP não encontrado",
            description: "Verifique o CEP digitado",
            variant: "destructive",
          })
        } else {
          setRua(data.logradouro || "")
          setBairro(data.bairro || "")
          setCidade(data.localidade || "")
          setEstado(data.uf || "")

          toast({
            title: "Endereço encontrado!",
            description: "Os campos foram preenchidos automaticamente",
          })
        }
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Tente novamente",
          variant: "destructive",
        })
      } finally {
        setCepLoading(false)
      }
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: existingClient } = await supabase.from("clientes").select("id, user_id").eq("email", email).single()

      if (existingClient) {
        setExistingClientId(existingClient.id)

        if (existingClient.user_id) {
          setEmailStatus("has-password")
          setStep("login")
        } else {
          setEmailStatus("no-password")
          setStep("create-password")
        }
      } else {
        setEmailStatus("new")
        setStep("create-password")
      }
    } catch (error) {
      toast({
        title: "Erro ao verificar email",
        description: "Tente novamente",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        toast({
          title: "Erro ao fazer login",
          description: "Verifique seu email e senha",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta.",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, verifique se as senhas são iguais.",
        variant: "destructive",
      })
      return
    }

    if (emailStatus === "no-password") {
      setLoading(true)

      try {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })

        if (signUpError) {
          toast({
            title: "Erro ao criar senha",
            description: signUpError.message,
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        if (authData.user && existingClientId) {
          const { error: updateError } = await supabase
            .from("clientes")
            .update({
              user_id: authData.user.id,
              origem: "vinculado",
            })
            .eq("id", existingClientId)

          if (updateError) {
            toast({
              title: "Erro ao vincular conta",
              description: "Tente novamente",
              variant: "destructive",
            })
            setLoading(false)
            return
          }

          toast({
            title: "Conta criada com sucesso!",
            description: "Faça login para acessar sua conta.",
          })

          window.location.href = "/login"
        }
      } catch (error) {
        toast({
          title: "Erro inesperado",
          description: "Tente novamente mais tarde",
          variant: "destructive",
        })
        setLoading(false)
      }
    } else if (emailStatus === "new") {
      setStep("additional-info")
    }
  }

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (signUpError) {
        toast({
          title: "Erro ao criar conta",
          description: signUpError.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (authData.user) {
        const { error: insertError } = await supabase.from("clientes").insert({
          user_id: authData.user.id,
          email,
          nome,
          cpf: cpf || null,
          telefone: telefone || null,
          rua: rua || null,
          numero: numero || null,
          complemento: complemento || null,
          bairro: bairro || null,
          cidade: cidade || null,
          estado: estado || null,
          cep: cep || null,
          data_nascimento: dataNascimento || null,
          origem: "self_register",
        })

        if (insertError) {
          toast({
            title: "Erro ao criar cadastro",
            description: insertError.message,
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        toast({
          title: "Conta criada com sucesso!",
          description: "Faça login para acessar sua conta.",
        })

        window.location.href = "/login"
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (step === "email") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo à SIVIRINA</CardTitle>
          <CardDescription>Digite seu email para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verificando..." : "Continuar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (step === "login") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Digite sua senha para acessar sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("email")
                  setPassword("")
                }}
                disabled={loading}
                className="w-full"
              >
                Voltar
              </Button>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (step === "create-password") {
    const passwordsMatch = password && confirmPassword && password === confirmPassword
    const showPasswordFeedback = password && confirmPassword

    return (
      <Card>
        <CardHeader>
          <CardTitle>{emailStatus === "no-password" ? "Criar Senha" : "Criar Conta"}</CardTitle>
          <CardDescription>
            {emailStatus === "no-password"
              ? "Seu email já está cadastrado. Crie uma senha para acessar sua conta."
              : "Crie uma senha para sua nova conta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
              {showPasswordFeedback && (
                <p className={`text-sm ${passwordsMatch ? "text-green-600" : "text-red-600"}`}>
                  {passwordsMatch ? "✓ As senhas coincidem" : "✗ As senhas não coincidem"}
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("email")
                  setPassword("")
                  setConfirmPassword("")
                }}
                disabled={loading}
                className="w-[48%] px-0 mx-[3px]"
              >
                Voltar
              </Button>
              <Button type="submit" className="w-[48%]" disabled={loading}>
                {loading ? "Processando..." : emailStatus === "no-password" ? "Criar Senha" : "Continuar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete seu Cadastro</CardTitle>
        <CardDescription>Preencha seus dados para criar sua conta</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCompleteRegistration} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
            <Input
              id="data_nascimento"
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Endereço (opcional)</h3>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                disabled={loading || cepLoading}
                maxLength={8}
              />
              {cepLoading && <p className="text-sm text-muted-foreground">Buscando endereço...</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  type="text"
                  placeholder="Nome da rua"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  type="text"
                  placeholder="123"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  type="text"
                  placeholder="Apto, bloco, etc"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  type="text"
                  placeholder="Nome do bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  type="text"
                  placeholder="Cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  type="text"
                  placeholder="UF"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  maxLength={2}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("create-password")}
              disabled={loading}
              className="w-[48%] mx-[3px]"
            >
              Voltar
            </Button>
            <Button type="submit" className="w-[48%]" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
