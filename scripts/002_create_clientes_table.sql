-- Create clientes table
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT,
  telefone TEXT,
  email TEXT,
  rua TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  ano_nascimento INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);

-- Create index on cpf for faster lookups
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf);

-- Enable Row Level Security
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users (admin only)
CREATE POLICY "Allow all operations for authenticated users" ON clientes
  FOR ALL
  USING (auth.role() = 'authenticated');
