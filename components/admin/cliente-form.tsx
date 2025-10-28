"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type ClienteFormProps = {
  cliente?: {
    id: string
    nome: string
    cpf: string | null
    telefone: string | null
    email: string | null
    rua: string | null
    numero: string | null
    complemento: string | null
    bairro: string | null
    cidade: string | null
    estado: string | null
    cep: string | null
    ano_nascimento: number | null
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function ClienteForm({ cliente, onSuccess, onCancel }: ClienteFormProps) {
  const [nome, setNome] = useState(cliente?.nome || "")
  const [cpf, setCpf] = useState(cliente?.cpf || "")
  const [telefone, setTelefone] = useState(cliente?.telefone || "")
  const [email, setEmail] = useState(cliente?.email || "")
  const [rua, setRua] = useState(cliente?.rua || "")
  const [numero, setNumero] = useState(cliente?.numero || "")
  const [complemento, setComplemento] = useState(cliente?.complemento || "")
  const [bairro, setBairro] = useState(cliente?.bairro || "")
  const [cidade, setCidade] = useState(cliente?.cidade || "")
  const [estado, setEstado] = useState(cliente?.estado || "")
  const [cep, setCep] = useState(cliente?.cep || "")
  const [anoNascimento, setAnoNascimento] = useState(cliente?.ano_nascimento?.toString() || "")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const clienteData = {
        nome,
        cpf: cpf || null,
        telefone: telefone || null,
        email: email || null,
        rua: rua || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        cep: cep || null,
        ano_nascimento: anoNascimento ? Number.parseInt(anoNascimento) : null,
      }

      if (cliente?.id) {
        const { error } = await supabase.from("clientes").update(clienteData).eq("id", cliente.id)

        if (error) throw error

        toast({
          title: "Cliente atualizado",
          description: "As alterações foram salvas com sucesso",
        })
      } else {
        const { error } = await supabase.from("clientes").insert(clienteData)

        if (error) throw error

        toast({
          title: "Cliente criado",
          description: "O cliente foi adicionado com sucesso",
        })
      }

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o cliente",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Ex: Maria Silva"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ano_nascimento">Ano de Nascimento</Label>
            <Input
              id="ano_nascimento"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={anoNascimento}
              onChange={(e) => setAnoNascimento(e.target.value)}
              placeholder="1990"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Endereço</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="rua">Rua</Label>
                <Input id="rua" value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Nome da rua" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Apto, bloco, etc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Nome do bairro"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Nome da cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 bg-transparent"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "Salvando..." : cliente ? "Atualizar" : "Criar Cliente"}
          </Button>
        </div>
      </div>
    </form>
  )
}
