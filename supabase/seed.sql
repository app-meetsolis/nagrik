-- ============================================================
-- Nagrik — Demo Seed Data (Epic 4.1)
-- Run in Supabase SQL Editor AFTER schema.sql and authorities.sql
-- Safe to run multiple times (idempotent).
-- ============================================================

-- ── 1. Demo citizen (owner of all seed issues) ─────────────
INSERT INTO public.citizens (clerk_user_id)
VALUES ('demo_citizen_seed')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- ── 2. Demo authorities (leaderboard entries) ──────────────
-- Note: These don't have real Clerk accounts.
-- They appear on the leaderboard + map only.
INSERT INTO public.authorities
  (clerk_user_id, name, ward_id, score, resolution_count, escalation_count, verified)
VALUES
  ('demo_priya',
   'Priya Sharma',
   (SELECT id FROM public.wards WHERE geojson_id = 'ward_3'),
   92, 28, 1, true),

  ('demo_ravi',
   'Ravi Kumar',
   (SELECT id FROM public.wards WHERE geojson_id = 'ward_8'),
   81, 19, 3, true),

  ('demo_sunita',
   'Sunita Verma',
   (SELECT id FROM public.wards WHERE geojson_id = 'ward_17'),
   75, 15, 4, true),

  ('demo_arjun',
   'Arjun Mehta',
   (SELECT id FROM public.wards WHERE geojson_id = 'ward_1'),
   63, 11, 6, true),

  ('demo_kavita',
   'Kavita Singh',
   (SELECT id FROM public.wards WHERE geojson_id = 'ward_5'),
   44,  6, 9, true)

ON CONFLICT (clerk_user_id) DO UPDATE SET
  score            = EXCLUDED.score,
  resolution_count = EXCLUDED.resolution_count,
  escalation_count = EXCLUDED.escalation_count;

-- ── 3. Seed resolved issues ────────────────────────────────
-- Spread across demo authority wards. Picsum provides real-looking
-- placeholder photos. ON CONFLICT guard prevents duplicate runs.

DO $$
DECLARE
  v_citizen uuid := (SELECT id FROM public.citizens WHERE clerk_user_id = 'demo_citizen_seed');
BEGIN

  -- helper: insert one resolved issue if no seed issue exists for that photo_url
  -- (photo_url is unique enough as a duplicate guard)

  -- ward_3 / Priya Sharma
  INSERT INTO public.issues (citizen_id, ward_id, authority_id, photo_url, ai_category, ai_severity, status, resolution_photo_url, created_at, resolved_at)
  SELECT v_citizen, w.id, a.id,
    'https://picsum.photos/seed/nagrik_i1/600/400', 'garbage', 'moderate', 'resolved',
    'https://picsum.photos/seed/nagrik_r1/600/400',
    now()-interval '5 days', now()-interval '3 days'
  FROM public.wards w, public.authorities a
  WHERE w.geojson_id='ward_3' AND a.clerk_user_id='demo_priya'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.issues (citizen_id, ward_id, authority_id, photo_url, ai_category, ai_severity, status, resolution_photo_url, created_at, resolved_at)
  SELECT v_citizen, w.id, a.id,
    'https://picsum.photos/seed/nagrik_i2/600/400', 'pothole', 'critical', 'resolved',
    'https://picsum.photos/seed/nagrik_r2/600/400',
    now()-interval '8 days', now()-interval '5 days'
  FROM public.wards w, public.authorities a
  WHERE w.geojson_id='ward_3' AND a.clerk_user_id='demo_priya'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.issues (citizen_id, ward_id, authority_id, photo_url, ai_category, ai_severity, status, resolution_photo_url, created_at, resolved_at)
  SELECT v_citizen, w.id, a.id,
    'https://picsum.photos/seed/nagrik_i3/600/400', 'streetlight', 'minor', 'resolved',
    'https://picsum.photos/seed/nagrik_r3/600/400',
    now()-interval '12 days', now()-interval '9 days'
  FROM public.wards w, public.authorities a
  WHERE w.geojson_id='ward_3' AND a.clerk_user_id='demo_priya'
  ON CONFLICT DO NOTHING;

  -- ward_8 / Ravi Kumar
  INSERT INTO public.issues (citizen_id, ward_id, authority_id, photo_url, ai_category, ai_severity, status, resolution_photo_url, created_at, resolved_at)
  SELECT v_citizen, w.id, a.id,
    'https://picsum.photos/seed/nagrik_i4/600/400', 'drainage', 'moderate', 'resolved',
    'https://picsum.photos/seed/nagrik_r4/600/400',
    now()-interval '6 days', now()-interval '4 days'
  FROM public.wards w, public.authorities a
  WHERE w.geojson_id='ward_8' AND a.clerk_user_id='demo_ravi'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.issues (citizen_id, ward_id, authority_id, photo_url, ai_category, ai_severity, status, resolution_photo_url, created_at, resolved_at)
  SELECT v_citizen, w.id, a.id,
    'https://picsum.photos/seed/nagrik_i5/600/400', 'garbage', 'critical', 'resolved',
    'https://picsum.photos/seed/nagrik_r5/600/400',
    now()-interval '10 days', now()-interval '7 days'
  FROM public.wards w, public.authorities a
  WHERE w.geojson_id='ward_8' AND a.clerk_user_id='demo_ravi'
  ON CONFLICT DO NOTHING;

  -- ward_17 / Sunita Verma
  INSERT INTO public.issues (citizen_id, ward_id, authority_id, photo_url, ai_category, ai_severity, status, resolution_photo_url, created_at, resolved_at)
  SELECT v_citizen, w.id, a.id,
    'https://picsum.photos/seed/nagrik_i6/600/400', 'pothole', 'moderate', 'resolved',
    'https://picsum.photos/seed/nagrik_r6/600/400',
    now()-interval '4 days', now()-interval '2 days'
  FROM public.wards w, public.authorities a
  WHERE w.geojson_id='ward_17' AND a.clerk_user_id='demo_sunita'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.issues (citizen_id, ward_id, authority_id, photo_url, ai_category, ai_severity, status, resolution_photo_url, created_at, resolved_at)
  SELECT v_citizen, w.id, a.id,
    'https://picsum.photos/seed/nagrik_i7/600/400', 'garbage', 'minor', 'resolved',
    'https://picsum.photos/seed/nagrik_r7/600/400',
    now()-interval '9 days', now()-interval '7 days'
  FROM public.wards w, public.authorities a
  WHERE w.geojson_id='ward_17' AND a.clerk_user_id='demo_sunita'
  ON CONFLICT DO NOTHING;

  -- ward_1 / Arjun Mehta
  INSERT INTO public.issues (citizen_id, ward_id, authority_id, photo_url, ai_category, ai_severity, status, resolution_photo_url, created_at, resolved_at)
  SELECT v_citizen, w.id, a.id,
    'https://picsum.photos/seed/nagrik_i8/600/400', 'drainage', 'critical', 'resolved',
    'https://picsum.photos/seed/nagrik_r8/600/400',
    now()-interval '7 days', now()-interval '5 days'
  FROM public.wards w, public.authorities a
  WHERE w.geojson_id='ward_1' AND a.clerk_user_id='demo_arjun'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.issues (citizen_id, ward_id, authority_id, photo_url, ai_category, ai_severity, status, resolution_photo_url, created_at, resolved_at)
  SELECT v_citizen, w.id, a.id,
    'https://picsum.photos/seed/nagrik_i9/600/400', 'streetlight', 'moderate', 'resolved',
    'https://picsum.photos/seed/nagrik_r9/600/400',
    now()-interval '15 days', now()-interval '12 days'
  FROM public.wards w, public.authorities a
  WHERE w.geojson_id='ward_1' AND a.clerk_user_id='demo_arjun'
  ON CONFLICT DO NOTHING;

  -- ward_5 / Kavita Singh
  INSERT INTO public.issues (citizen_id, ward_id, authority_id, photo_url, ai_category, ai_severity, status, resolution_photo_url, created_at, resolved_at)
  SELECT v_citizen, w.id, a.id,
    'https://picsum.photos/seed/nagrik_i10/600/400', 'garbage', 'critical', 'resolved',
    'https://picsum.photos/seed/nagrik_r10/600/400',
    now()-interval '3 days', now()-interval '2 days'
  FROM public.wards w, public.authorities a
  WHERE w.geojson_id='ward_5' AND a.clerk_user_id='demo_kavita'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.issues (citizen_id, ward_id, authority_id, photo_url, ai_category, ai_severity, status, resolution_photo_url, created_at, resolved_at)
  SELECT v_citizen, w.id, a.id,
    'https://picsum.photos/seed/nagrik_i11/600/400', 'pothole', 'moderate', 'resolved',
    'https://picsum.photos/seed/nagrik_r11/600/400',
    now()-interval '11 days', now()-interval '9 days'
  FROM public.wards w, public.authorities a
  WHERE w.geojson_id='ward_5' AND a.clerk_user_id='demo_kavita'
  ON CONFLICT DO NOTHING;

  -- one pending issue in a low-score ward (for demo)
  INSERT INTO public.issues (citizen_id, ward_id, authority_id, photo_url, ai_category, ai_severity, status, created_at)
  SELECT v_citizen, w.id, NULL,
    'https://picsum.photos/seed/nagrik_i12/600/400', 'garbage', 'critical', 'pending',
    now()-interval '1 day'
  FROM public.wards w
  WHERE w.geojson_id='ward_15'
  ON CONFLICT DO NOTHING;

END $$;

-- ── 4. Bump ward scores to look more realistic post-activity ─
UPDATE public.wards SET score = 90 WHERE geojson_id = 'ward_3';   -- Malviya Nagar
UPDATE public.wards SET score = 84 WHERE geojson_id = 'ward_8';   -- Civil Lines
UPDATE public.wards SET score = 78 WHERE geojson_id = 'ward_17';  -- Vidhyadhar Nagar
UPDATE public.wards SET score = 64 WHERE geojson_id = 'ward_1';   -- Vaishali Nagar
UPDATE public.wards SET score = 32 WHERE geojson_id = 'ward_5';   -- Sanganer
UPDATE public.wards SET score = 28 WHERE geojson_id = 'ward_15';  -- Sitapura (unresolved critical)
UPDATE public.wards SET score = 72 WHERE geojson_id = 'ward_20';  -- Banipark
