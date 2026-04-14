-- ============================================================
-- Nagrik — Story 2.1 Migration
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- ── AUTHORITIES TABLE ──────────────────────────────────────
create table if not exists public.authorities (
  id               uuid primary key default uuid_generate_v4(),
  clerk_user_id    text not null unique,
  name             text not null,
  ward_id          uuid references public.wards(id) on delete set null,
  score            integer not null default 70,
  resolution_count integer not null default 0,
  escalation_count integer not null default 0,
  photo_url        text,
  verified         boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ── ESCALATION EVENTS TABLE ────────────────────────────────
create table if not exists public.escalation_events (
  id           uuid primary key default uuid_generate_v4(),
  issue_id     uuid references public.issues(id) on delete cascade,
  authority_id uuid references public.authorities(id) on delete cascade,
  event_type   text not null check (event_type in ('resolution', 'escalation')),
  score_delta  integer not null,
  created_at   timestamptz not null default now()
);

-- ── FK: issues → authorities ───────────────────────────────
-- Safe to run even if the FK already exists
do $$ begin
  alter table public.issues
    add constraint issues_authority_id_fkey
    foreign key (authority_id) references public.authorities(id) on delete set null;
exception when duplicate_object then null;
end $$;

-- ── RLS ────────────────────────────────────────────────────
alter table public.authorities      enable row level security;
alter table public.escalation_events enable row level security;

-- Authorities: anyone can read (for leaderboard / profiles)
create policy "authorities_public_read"
  on public.authorities for select using (true);

-- Issues: authority reads issues assigned to them
create policy "issues_authority_read"
  on public.issues for select
  using (
    authority_id in (
      select id from public.authorities where clerk_user_id = auth.uid()::text
    )
  );

-- Issues: authority can update (resolve) their issues
create policy "issues_authority_update"
  on public.issues for update
  using (
    authority_id in (
      select id from public.authorities where clerk_user_id = auth.uid()::text
    )
  );

-- Escalation events: public read (for score transparency)
create policy "escalation_events_public_read"
  on public.escalation_events for select using (true);

-- ── REAL-TIME ──────────────────────────────────────────────
alter publication supabase_realtime add table public.authorities;
alter publication supabase_realtime add table public.escalation_events;

-- ============================================================
-- SEED: Insert your test authority
--
-- Steps:
--   1. Go to Clerk Dashboard → Users → your authority test account
--   2. Copy the User ID (looks like: user_2abc123...)
--   3. Find a ward UUID:
--        SELECT id, name FROM public.wards LIMIT 5;
--   4. Replace the placeholders below and run
-- ============================================================
/*
insert into public.authorities (clerk_user_id, name, ward_id, score, verified)
values (
  'user_REPLACE_WITH_CLERK_USER_ID',
  'Officer Rajesh Kumar',
  (select id from public.wards where geojson_id = 'ward_8'), -- Civil Lines
  70,
  true
);
*/
