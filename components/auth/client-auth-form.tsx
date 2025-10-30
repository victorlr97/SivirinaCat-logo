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

type Step = "credentials" | "additional-info"

export function ClientAuthForm() {
  const [step, setStep] = useState<Step>("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // Dados adicionais para novos clientes
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

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Verifica se email já existe na tabela clientes
      const { data: existingClient } = await supabase.from("clientes").select("id, user_id").eq("email", email).single()

      console.log("[v0] Existing client check:", existingClient)

      if (existingClient && !existingClient.user_id) {
        // Email existe mas não tem user_id (cadastrado pelo admin)
        // Cria autenticação e vincula
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
          // Vincula user_id ao cliente existente
          const { error: updateError } = await supabase
            .from("clientes")
            .update({
              user_id: authData.user.id,
              origem: "vinculado",
            })
            .eq("id", existingClient.id)

          if (updateError) {
            console.error("[v0] Error updating client:", updateError)
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
            description: "Seus dados foram vinculados à sua conta.",
          })

          router.push("/")
          router.refresh()
        }
      } else if (existingClient && existingClient.user_id) {
        // Email existe e já tem user_id - fazer login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          toast({
            title: "Erro ao fazer login",
            description: signInError.message,
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
      } else {
        // Email não existe - pedir dados adicionais
        setStep("additional-info")
      }
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Cria autenticação
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
        // Cria registro completo na tabela clientes
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
          console.error("[v0] Error inserting client:", insertError)
          toast({
            title: "Erro ao criar cadastro",
            description: "Tente novamente",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo à SIVIRINA.",
        })

        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (step === "credentials") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entrar ou Criar Conta</CardTitle>
          <CardDescription>Digite seu email e senha para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
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
              />
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
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input
              id="data_nascimento"
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Endereço (opcional)</h3>

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

            <div className="grid gap-4 sm:grid-cols-3">
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
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("credentials")}
              disabled={loading}
              className="w-full"
            >
              Voltar
            </Button>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
