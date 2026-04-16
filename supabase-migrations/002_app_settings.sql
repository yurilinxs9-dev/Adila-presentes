-- Tabela de configurações da aplicação (singleton: id=1)
create table if not exists public.app_settings (
  id            int primary key default 1,
  meta_pixel_id text,
  meta_access_token text,
  meta_test_event_code text,
  updated_at    timestamptz not null default now(),
  constraint singleton check (id = 1)
);

-- Insere a linha única se não existir
insert into public.app_settings (id) values (1)
on conflict (id) do nothing;

-- RLS: bloqueia tudo do client (anon). Apenas service_role acessa.
alter table public.app_settings enable row level security;
-- (não criar nenhuma policy = nenhum acesso para anon/authenticated)
