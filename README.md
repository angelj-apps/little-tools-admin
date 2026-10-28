# Little Tools Ops (admin)

Admin control room for Little Tools (`hw1`). **Same Supabase project** as the main app — not a separate database.

## Features

| Area | Access |
|------|--------|
| Users (`profiles`) | read |
| Prompt chains / steps | read |
| Prompt chain mix | read / update |
| Terms | CRUD |
| AI media (`tool_cards`) | CRUD |
| Ratings (`tool_votes`) | read |
| Generation requests | read |
| AI generation examples | CRUD |
| LLM providers / models | CRUD |
| LLM responses | read |
| Allowed signup domains | CRUD |
| Whitelisted emails | CRUD |
| Images (+ upload) | CRUD |

Every route requires Google login **and** `profiles.is_superadmin = true`.

## Setup SQL (run in hw1 Supabase)

1. `supabase/admin.sql` — `is_superadmin` + base policies  
2. `supabase/admin-entities.sql` — new tables + storage bucket `admin-images`

Promote yourself:

```sql
update public.profiles p
set is_superadmin = true
from auth.users u
where p.id = u.id
  and u.email = 'you@example.com';
```

## Local

```bash
npm install
# .env.local = same keys as hw1
npm run dev -- --port 3001
```

## Vercel

Same Supabase env vars as hw1. Turn **Deployment Protection** off so Incognito works.
