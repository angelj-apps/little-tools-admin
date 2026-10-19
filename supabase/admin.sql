-- Little Tools Admin: superadmin flag + elevated RLS policies.
-- Run once in the Supabase SQL editor (same project as the main app).

alter table public.profiles
  add column if not exists is_superadmin boolean not null default false;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_superadmin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_superadmin() from public;
grant execute on function public.is_superadmin() to authenticated;

-- Profiles: ensure authenticated users can read rows (needed for admin user list).
alter table public.profiles enable row level security;

drop policy if exists "Authenticated can read profiles" on public.profiles;
create policy "Authenticated can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Tool cards: superadmins can manage every row.
drop policy if exists "Superadmins insert any tool card" on public.tool_cards;
create policy "Superadmins insert any tool card"
  on public.tool_cards for insert
  to authenticated
  with check (public.is_superadmin());

drop policy if exists "Superadmins update any tool card" on public.tool_cards;
create policy "Superadmins update any tool card"
  on public.tool_cards for update
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

drop policy if exists "Superadmins delete any tool card" on public.tool_cards;
create policy "Superadmins delete any tool card"
  on public.tool_cards for delete
  to authenticated
  using (public.is_superadmin());

grant delete on table public.tool_cards to authenticated;

-- Votes: superadmins can read the full ratings table.
drop policy if exists "Superadmins read all tool votes" on public.tool_votes;
create policy "Superadmins read all tool votes"
  on public.tool_votes for select
  to authenticated
  using (public.is_superadmin());

-- Bootstrap (run after you sign in once with Google so your profile row exists):
--   update public.profiles
--   set is_superadmin = true
--   where id = '<your-auth-user-uuid>';
-- Or match by email via auth.users:
--   update public.profiles p
--   set is_superadmin = true
--   from auth.users u
--   where p.id = u.id and u.email = 'you@example.com';
