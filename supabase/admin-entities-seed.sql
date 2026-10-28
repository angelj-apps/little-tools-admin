-- Sample data for admin-entities tables.
-- Run after admin.sql + admin-entities.sql.
-- Safe to re-run: uses fixed UUIDs + ON CONFLICT where possible.

-- ---------- Providers ----------
insert into public.llm_providers (id, name, slug, base_url, notes, is_active)
values
  ('11111111-1111-1111-1111-111111111101', 'OpenRouter', 'openrouter', 'https://openrouter.ai/api/v1', 'Primary router for class demos', true),
  ('11111111-1111-1111-1111-111111111102', 'OpenAI', 'openai', 'https://api.openai.com/v1', 'Direct OpenAI (optional)', true),
  ('11111111-1111-1111-1111-111111111103', 'Local stub', 'local-stub', null, 'Offline / fake provider for tests', false)
on conflict (slug) do update set
  name = excluded.name,
  base_url = excluded.base_url,
  notes = excluded.notes,
  is_active = excluded.is_active,
  updated_at = now();

-- ---------- Models ----------
insert into public.llm_models (id, provider_id, name, slug, max_tokens, is_active)
values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'GPT-4o mini', 'openrouter/gpt-4o-mini', 16000, true),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'Claude Haiku', 'openrouter/claude-haiku', 8000, true),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111102', 'GPT-4.1', 'openai/gpt-4.1', 32000, true)
on conflict (slug) do update set
  provider_id = excluded.provider_id,
  name = excluded.name,
  max_tokens = excluded.max_tokens,
  is_active = excluded.is_active,
  updated_at = now();

-- ---------- Prompt chains ----------
insert into public.prompt_chains (id, name, description, is_active)
values
  ('33333333-3333-3333-3333-333333333301', 'Tool card draft', 'Turn a learner goal into a Little Tools card', true),
  ('33333333-3333-3333-3333-333333333302', 'Clarify simpler', 'Rewrite a card explanation for beginners', true),
  ('33333333-3333-3333-3333-333333333303', 'Practice grader', 'Grade a practice attempt and suggest a fix', true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  is_active = excluded.is_active,
  updated_at = now();

-- ---------- Steps ----------
insert into public.prompt_chain_steps (id, prompt_chain_id, position, name, prompt_template, model_id)
values
  (
    '44444444-4444-4444-4444-444444444401',
    '33333333-3333-3333-3333-333333333301',
    1,
    'Outline capability',
    'Goal: {{goal}}\nAttempt: {{attempt}}\nWrite a one-line capability title and a short "what it does".',
    '22222222-2222-2222-2222-222222222201'
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    '33333333-3333-3333-3333-333333333301',
    2,
    'Write code sample',
    'Using the outline:\n{{previous_output}}\nProduce a tiny Python snippet with example input/output.',
    '22222222-2222-2222-2222-222222222201'
  ),
  (
    '44444444-4444-4444-4444-444444444403',
    '33333333-3333-3333-3333-333333333302',
    1,
    'Simplify explanation',
    'Rewrite for a beginner:\n{{explanation}}',
    '22222222-2222-2222-2222-222222222202'
  ),
  (
    '44444444-4444-4444-4444-444444444404',
    '33333333-3333-3333-3333-333333333303',
    1,
    'Grade attempt',
    'Prompt: {{prompt}}\nAnswer: {{answer}}\nReturn pass/fail and a short hint.',
    '22222222-2222-2222-2222-222222222203'
  )
on conflict (id) do update set
  prompt_chain_id = excluded.prompt_chain_id,
  position = excluded.position,
  name = excluded.name,
  prompt_template = excluded.prompt_template,
  model_id = excluded.model_id;

-- ---------- Mix ----------
insert into public.prompt_chain_mix (id, prompt_chain_id, weight, label)
values
  ('55555555-5555-5555-5555-555555555501', '33333333-3333-3333-3333-333333333301', 50, 'Card drafting'),
  ('55555555-5555-5555-5555-555555555502', '33333333-3333-3333-3333-333333333302', 30, 'Simplifier'),
  ('55555555-5555-5555-5555-555555555503', '33333333-3333-3333-3333-333333333303', 20, 'Grader')
on conflict (prompt_chain_id) do update set
  weight = excluded.weight,
  label = excluded.label,
  updated_at = now();

-- ---------- Terms ----------
insert into public.terms (id, slug, title, body, version, is_published)
values
  (
    '66666666-6666-6666-6666-666666666601',
    'terms-of-use',
    'Terms of use',
    'Little Tools is a class project. Do not upload secrets. Generated code may be wrong — always review it.',
    1,
    true
  ),
  (
    '66666666-6666-6666-6666-666666666602',
    'privacy',
    'Privacy note',
    'We store your Google profile basics, tool cards, votes, and practice attempts in Supabase for this course.',
    1,
    true
  ),
  (
    '66666666-6666-6666-6666-666666666603',
    'ai-disclaimer',
    'AI disclaimer (draft)',
    'Model outputs are experimental and may hallucinate APIs or syntax.',
    1,
    false
  )
on conflict (slug) do update set
  title = excluded.title,
  body = excluded.body,
  version = excluded.version,
  is_published = excluded.is_published,
  updated_at = now();

-- ---------- Generation requests (attach to first profile if any) ----------
with first_profile as (
  select id from public.profiles order by updated_at desc nulls last limit 1
)
insert into public.generation_requests (id, user_id, prompt_chain_id, input_text, status, created_at)
select
  v.id,
  (select id from first_profile),
  v.prompt_chain_id,
  v.input_text,
  v.status,
  now() - (v.mins || ' minutes')::interval
from (
  values
    (
      '77777777-7777-7777-7777-777777777701'::uuid,
      '33333333-3333-3333-3333-333333333301'::uuid,
      'How do I check if a name is in a friends list?',
      'completed',
      40
    ),
    (
      '77777777-7777-7777-7777-777777777702'::uuid,
      '33333333-3333-3333-3333-333333333302'::uuid,
      'Make the membership explanation simpler.',
      'completed',
      25
    ),
    (
      '77777777-7777-7777-7777-777777777703'::uuid,
      '33333333-3333-3333-3333-333333333303'::uuid,
      'Grade: for x in nums: print(x)',
      'pending',
      5
    )
) as v(id, prompt_chain_id, input_text, status, mins)
on conflict (id) do update set
  input_text = excluded.input_text,
  status = excluded.status,
  prompt_chain_id = excluded.prompt_chain_id;

-- ---------- Examples ----------
insert into public.ai_generation_examples (id, title, input_text, output_text, prompt_chain_id, notes)
values
  (
    '88888888-8888-8888-8888-888888888801',
    'Membership with in',
    'check whether an item exists in a list',
    'title: Check membership with in\ncode uses `name in friends`',
    '33333333-3333-3333-3333-333333333301',
    'Good beginner example'
  ),
  (
    '88888888-8888-8888-8888-888888888802',
    'Len of scores',
    'get the number of items in a list',
    'title: Count items with len()\nprint(len(scores))',
    '33333333-3333-3333-3333-333333333301',
    null
  )
on conflict (id) do update set
  title = excluded.title,
  input_text = excluded.input_text,
  output_text = excluded.output_text,
  prompt_chain_id = excluded.prompt_chain_id,
  notes = excluded.notes,
  updated_at = now();

-- ---------- LLM responses ----------
insert into public.llm_responses (id, generation_request_id, model_id, prompt, response_text, latency_ms, created_at)
values
  (
    '99999999-9999-9999-9999-999999999901',
    '77777777-7777-7777-7777-777777777701',
    '22222222-2222-2222-2222-222222222201',
    'Goal: check whether an item exists in a list',
    '{"title":"Check membership with in","code":"print(name in friends)"}',
    842,
    now() - interval '39 minutes'
  ),
  (
    '99999999-9999-9999-9999-999999999902',
    '77777777-7777-7777-7777-777777777702',
    '22222222-2222-2222-2222-222222222202',
    'Rewrite for a beginner: membership with in',
    '`in` asks: is this value somewhere in the list? It answers True or False.',
    1104,
    now() - interval '24 minutes'
  )
on conflict (id) do update set
  prompt = excluded.prompt,
  response_text = excluded.response_text,
  latency_ms = excluded.latency_ms,
  model_id = excluded.model_id;

-- ---------- Signup access ----------
insert into public.allowed_signup_domains (id, domain, notes)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'columbia.edu', 'Course cohort'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'barnard.edu', 'Cross-listed students'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'gmail.com', 'Demo only — tighten later')
on conflict (domain) do update set notes = excluded.notes;

insert into public.whitelisted_emails (id, email, notes)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'ta@example.com', 'Course TA'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'instructor@example.com', 'Instructor'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'demo.learner@example.com', 'Guest demo account')
on conflict (email) do update set notes = excluded.notes;

-- ---------- Images (metadata only — upload a real file via admin /images for storage) ----------
insert into public.images (id, path, public_url, alt_text, created_by)
select
  'cccccccc-cccc-cccc-cccc-cccccccccc01',
  'seed/placeholder-card.svg',
  'https://placehold.co/320x200/1a232c/d6ff4b?text=Little+Tools',
  'Placeholder card art',
  (select id from public.profiles order by updated_at desc nulls last limit 1)
on conflict (id) do update set
  public_url = excluded.public_url,
  alt_text = excluded.alt_text,
  updated_at = now();
