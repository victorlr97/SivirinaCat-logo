-- Add installments field to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS installments TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN products.installments IS 'Informação sobre parcelamento sem juros do produto';
