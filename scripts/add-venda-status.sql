-- Adiciona campos de status, motivo e controle de pagamento na tabela vendas

ALTER TABLE vendas
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'concluida'
    CHECK (status IN ('concluida', 'pendente', 'cancelada', 'devolucao')),
  ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT,
  ADD COLUMN IF NOT EXISTS pago BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS data_pagamento TIMESTAMPTZ;

-- Vendas existentes já estão concluídas e pagas
UPDATE vendas SET pago = true, data_pagamento = created_at WHERE pago IS NULL OR pago = false;

-- Index para filtrar por status rapidamente
CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas(status);
