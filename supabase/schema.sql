-- ============================================================
-- Nagrik — Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- WARDS TABLE
-- ============================================================
create table if not exists public.wards (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  city        text not null default 'jaipur',
  score       integer not null default 70,
  geojson_id  text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- CITIZENS TABLE
-- ============================================================
create table if not exists public.citizens (
  id            uuid primary key default uuid_generate_v4(),
  clerk_user_id text not null unique,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- ISSUES TABLE
-- ============================================================
create type public.issue_status as enum ('pending', 'in_progress', 'resolved');
create type public.issue_category as enum ('garbage', 'pothole', 'drainage', 'streetlight', 'other');
create type public.issue_severity as enum ('minor', 'moderate', 'critical');

create table if not exists public.issues (
  id                    uuid primary key default uuid_generate_v4(),
  citizen_id            uuid references public.citizens(id) on delete cascade,
  ward_id               uuid references public.wards(id) on delete set null,
  authority_id          uuid,                         -- references authorities(id), added in Story 2.1
  photo_url             text not null,
  ai_category           public.issue_category not null default 'other',
  ai_severity           public.issue_severity not null default 'moderate',
  status                public.issue_status not null default 'pending',
  resolution_photo_url  text,
  created_at            timestamptz not null default now(),
  resolved_at           timestamptz
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.wards    enable row level security;
alter table public.citizens enable row level security;
alter table public.issues   enable row level security;

-- Wards: public read (heat map is public)
create policy "wards_public_read"
  on public.wards for select
  using (true);

-- Citizens: user reads/manages their own record only
create policy "citizens_own_record"
  on public.citizens for all
  using (auth.uid()::text = clerk_user_id);

-- Issues: citizen reads only their own reports
create policy "issues_citizen_read_own"
  on public.issues for select
  using (
    citizen_id in (
      select id from public.citizens
      where clerk_user_id = auth.uid()::text
    )
  );

-- Issues: citizen can insert their own reports
create policy "issues_citizen_insert"
  on public.issues for insert
  with check (
    citizen_id in (
      select id from public.citizens
      where clerk_user_id = auth.uid()::text
    )
  );

-- Issues: public can read resolved issues (for authority profiles / audit trail)
create policy "issues_public_read_resolved"
  on public.issues for select
  using (status = 'resolved');

-- ============================================================
-- REAL-TIME
-- ============================================================
-- Enable real-time publication for all tables
alter publication supabase_realtime add table public.issues;
alter publication supabase_realtime add table public.wards;

-- ============================================================
-- STORAGE BUCKET FOR ISSUE PHOTOS
-- ============================================================
insert into storage.buckets (id, name, public)
values ('issue-photos', 'issue-photos', true)
on conflict (id) do nothing;

-- Storage policy: authenticated users can upload photos
create policy "issue_photos_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'issue-photos');

-- Storage policy: public can view photos
create policy "issue_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'issue-photos');

-- ============================================================
-- SEED: JAIPUR WARDS (20 wards for demo heat map)
-- ============================================================
insert into public.wards (name, city, score, geojson_id) values
  ('Vaishali Nagar',     'jaipur', 82, 'ward_1'),
  ('Mansarovar',         'jaipur', 76, 'ward_2'),
  ('Malviya Nagar',      'jaipur', 88, 'ward_3'),
  ('Jagatpura',          'jaipur', 45, 'ward_4'),
  ('Sanganer',           'jaipur', 38, 'ward_5'),
  ('Pratap Nagar',       'jaipur', 62, 'ward_6'),
  ('Pink City',          'jaipur', 71, 'ward_7'),
  ('Civil Lines',        'jaipur', 85, 'ward_8'),
  ('Bajaj Nagar',        'jaipur', 55, 'ward_9'),
  ('Nirman Nagar',       'jaipur', 67, 'ward_10'),
  ('Jhotwara',           'jaipur', 42, 'ward_11'),
  ('Shyam Nagar',        'jaipur', 73, 'ward_12'),
  ('Raja Park',          'jaipur', 79, 'ward_13'),
  ('Tonk Road',          'jaipur', 51, 'ward_14'),
  ('Sitapura',           'jaipur', 35, 'ward_15'),
  ('Durgapura',          'jaipur', 68, 'ward_16'),
  ('Vidhyadhar Nagar',   'jaipur', 83, 'ward_17'),
  ('Sodala',             'jaipur', 47, 'ward_18'),
  ('Murlipura',          'jaipur', 60, 'ward_19'),
  ('Banipark',           'jaipur', 77, 'ward_20')
on conflict do nothing;
