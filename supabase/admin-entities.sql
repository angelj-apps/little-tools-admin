-- Extra admin-managed tables for Little Tools (same Supabase project as hw1).
-- Requires supabase/admin.sql (is_superadmin + is_superadmin()) already applied.
--
-- Safe to run: CREATE IF NOT EXISTS only. DROP POLICY IF EXISTS is for re-runs.
-- RLS is enabled immediately on every new table (superadmin-only access).

-- ---------- helpers ----------
create or replace function public.admin_entities_apply_rls(table_name text)
returns void
language plpgsql
as $$
begin
  execute format('alter table public.%I enable row level security', table_name);

  execute format('drop policy if exists %I on public.%I', 'Superadmins select ' || table_name, table_name);
  execute format(
    'create policy %I on public.%I for select to authenticated using (public.is_superadmin())',
    'Superadmins select ' || table_name, table_name
  );

  execute format('drop policy if exists %I on public.%I', 'Superadmins insert ' || table_name, table_name);
  execute format(
    'create policy %I on public.%I for insert to authenticated with check (public.is_superadmin())',
    'Superadmins insert ' || table_name, table_name
  );

  execute format('drop policy if exists %I on public.%I', 'Superadmins update ' || table_name, table_name);
  execute format(
    'create policy %I on public.%I for update to authenticated using (public.is_superadmin()) with check (public.is_superadmin())',
    'Superadmins update ' || table_name, table_name
  );

  execute format('drop policy if exists %I on public.%I', 'Superadmins delete ' || table_name, table_name);
  execute format(
    'create policy %I on public.%I for delete to authenticated using (public.is_superadmin())',
    'Superadmins delete ' || table_name, table_name
  );

  execute format(
    'grant select, insert, update, delete on table public.%I to authenticated',
    table_name
  );
end;
$$;

-- ---------- LLM providers / models ----------
create table if not exists public.llm_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  base_url text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.llm_providers enable row level security;
select public.admin_entities_apply_rls('llm_providers');

create table if not exists public.llm_models (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.llm_providers (id) on delete set null,
  name text not null,
  slug text not null unique,
  max_tokens integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.llm_models enable row level security;
select public.admin_entities_apply_rls('llm_models');

-- ---------- Prompt chains ----------
create table if not exists public.prompt_chains (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.prompt_chains enable row level security;
select public.admin_entities_apply_rls('prompt_chains');

create table if not exists public.prompt_chain_steps (
  id uuid primary key default gen_random_uuid(),
  prompt_chain_id uuid not null references public.prompt_chains (id) on delete cascade,
  position integer not null default 1,
  name text not null,
  prompt_template text not null default '',
  model_id uuid references public.llm_models (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (prompt_chain_id, position)
);
alter table public.prompt_chain_steps enable row level security;
select public.admin_entities_apply_rls('prompt_chain_steps');

create table if not exists public.prompt_chain_mix (
  id uuid primary key default gen_random_uuid(),
  prompt_chain_id uuid not null references public.prompt_chains (id) on delete cascade,
  weight numeric(6,2) not null default 0 check (weight >= 0),
  label text,
  updated_at timestamptz not null default now(),
  unique (prompt_chain_id)
);
alter table public.prompt_chain_mix enable row level security;
select public.admin_entities_apply_rls('prompt_chain_mix');

-- ---------- Terms ----------
create table if not exists public.terms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null default '',
  version integer not null default 1,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.terms enable row level security;
select public.admin_entities_apply_rls('terms');

-- ---------- Generation pipeline ----------
create table if not exists public.generation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  prompt_chain_id uuid references public.prompt_chains (id) on delete set null,
  input_text text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.generation_requests enable row level security;
select public.admin_entities_apply_rls('generation_requests');

create table if not exists public.ai_generation_examples (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  input_text text not null default '',
  output_text text not null default '',
  prompt_chain_id uuid references public.prompt_chains (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ai_generation_examples enable row level security;
select public.admin_entities_apply_rls('ai_generation_examples');

create table if not exists public.llm_responses (
  id uuid primary key default gen_random_uuid(),
  generation_request_id uuid references public.generation_requests (id) on delete set null,
  model_id uuid references public.llm_models (id) on delete set null,
  prompt text not null default '',
  response_text text not null default '',
  latency_ms integer,
  created_at timestamptz not null default now()
);
alter table public.llm_responses enable row level security;
select public.admin_entities_apply_rls('llm_responses');

-- ---------- Access control lists ----------
create table if not exists public.allowed_signup_domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.allowed_signup_domains enable row level security;
select public.admin_entities_apply_rls('allowed_signup_domains');

create table if not exists public.whitelisted_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.whitelisted_emails enable row level security;
select public.admin_entities_apply_rls('whitelisted_emails');

-- ---------- Images ----------
create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  public_url text not null,
  alt_text text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.images enable row level security;
select public.admin_entities_apply_rls('images');

-- ---------- Storage bucket for image uploads ----------
insert into storage.buckets (id, name, public)
values ('admin-images', 'admin-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read admin images" on storage.objects;
create policy "Public read admin images"
  on storage.objects for select
  using (bucket_id = 'admin-images');

drop policy if exists "Superadmins upload admin images" on storage.objects;
create policy "Superadmins upload admin images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'admin-images' and public.is_superadmin());

drop policy if exists "Superadmins update admin images" on storage.objects;
create policy "Superadmins update admin images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'admin-images' and public.is_superadmin())
  with check (bucket_id = 'admin-images' and public.is_superadmin());

drop policy if exists "Superadmins delete admin images" on storage.objects;
create policy "Superadmins delete admin images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'admin-images' and public.is_superadmin());
