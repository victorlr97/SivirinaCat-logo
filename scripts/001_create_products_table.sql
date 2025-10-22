-- Tabela de produtos para o catálogo SIVIRINA
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2) not null,
  category text,
  sizes text[] default '{}',
  available boolean default true,
  image_url text,
  additional_images text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security
alter table public.products enable row level security;

-- Política: Todos podem visualizar produtos disponíveis (leitura pública)
create policy "products_select_public"
  on public.products for select
  using (available = true);

-- Política: Apenas usuários autenticados podem inserir produtos
create policy "products_insert_auth"
  on public.products for insert
  to authenticated
  with check (true);

-- Política: Apenas usuários autenticados podem atualizar produtos
create policy "products_update_auth"
  on public.products for update
  to authenticated
  using (true);

-- Política: Apenas usuários autenticados podem deletar produtos
create policy "products_delete_auth"
  on public.products for delete
  to authenticated
  using (true);

-- Função para atualizar o campo updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Trigger para atualizar updated_at quando um produto é modificado
drop trigger if exists products_updated_at on public.products;

create trigger products_updated_at
  before update on public.products
  for each row
  execute function public.handle_updated_at();

-- Índices para melhorar performance de consultas
create index if not exists products_category_idx on public.products(category);
create index if not exists products_available_idx on public.products(available);
create index if not exists products_created_at_idx on public.products(created_at desc);
