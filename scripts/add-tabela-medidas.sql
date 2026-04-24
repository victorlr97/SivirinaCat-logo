-- Adiciona coluna para armazenar tabela de medidas como JSON
ALTER TABLE products
ADD COLUMN IF NOT EXISTS tabela_medidas JSONB;

-- Exemplo da estrutura esperada:
-- {
--   "colunas": ["Tamanho", "Busto", "Cintura", "Quadril"],
--   "linhas": [
--     ["36 / PP", "82-86", "62-66", "88-94"],
--     ["38 / P", "88-92", "68-72", "96-100"]
--   ],
--   "notas": ["*Medidas em cm"]
-- }
