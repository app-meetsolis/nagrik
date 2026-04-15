-- ============================================================
-- Nagrik — Comprehensive Demo Seed Data
-- Run in Supabase SQL Editor AFTER schema.sql and authorities.sql
-- Idempotent: photo_url guards on issues, ON CONFLICT on everything else
-- ============================================================

-- ── 1. Demo citizens ────────────────────────────────────────
INSERT INTO public.citizens (clerk_user_id) VALUES
  ('demo_citizen_seed'),
  ('demo_c2'), ('demo_c3'), ('demo_c4'),
  ('demo_c5'), ('demo_c6'), ('demo_c7'), ('demo_c8')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- ── 2. Demo authorities (15 — full leaderboard) ─────────────
INSERT INTO public.authorities
  (clerk_user_id, name, ward_id, score, resolution_count, escalation_count, verified)
VALUES
  -- Top performers
  ('demo_priya',  'Priya Sharma',   (SELECT id FROM public.wards WHERE geojson_id='ward_3'),  92, 28,  1, true),
  ('demo_amit',   'Amit Gupta',     (SELECT id FROM public.wards WHERE geojson_id='ward_2'),  88, 22,  2, true),
  ('demo_neha',   'Neha Joshi',     (SELECT id FROM public.wards WHERE geojson_id='ward_4'),  83, 18,  2, true),
  ('demo_ravi',   'Ravi Kumar',     (SELECT id FROM public.wards WHERE geojson_id='ward_8'),  81, 19,  3, true),
  -- Middle pack
  ('demo_sunita', 'Sunita Verma',   (SELECT id FROM public.wards WHERE geojson_id='ward_17'), 75, 15,  4, true),
  ('demo_anita',  'Anita Verma',    (SELECT id FROM public.wards WHERE geojson_id='ward_12'), 74, 16,  3, true),
  ('demo_vikram', 'Vikram Singh',   (SELECT id FROM public.wards WHERE geojson_id='ward_9'),  72, 14,  4, true),
  ('demo_raj',    'Raj Patel',      (SELECT id FROM public.wards WHERE geojson_id='ward_6'),  67, 12,  5, true),
  ('demo_arjun',  'Arjun Mehta',    (SELECT id FROM public.wards WHERE geojson_id='ward_1'),  63, 11,  6, true),
  ('demo_suresh', 'Suresh Kumar',   (SELECT id FROM public.wards WHERE geojson_id='ward_11'), 61, 10,  6, true),
  -- Struggling
  ('demo_meena',  'Meena Rawat',    (SELECT id FROM public.wards WHERE geojson_id='ward_7'),  48,  5,  9, true),
  ('demo_deepak', 'Deepak Jain',    (SELECT id FROM public.wards WHERE geojson_id='ward_13'), 43,  6,  9, true),
  ('demo_kavita', 'Kavita Singh',   (SELECT id FROM public.wards WHERE geojson_id='ward_5'),  32,  4, 11, true),
  -- Bottom — accountability targets
  ('demo_pooja',  'Pooja Sharma',   (SELECT id FROM public.wards WHERE geojson_id='ward_10'), 28,  3, 12, true),
  ('demo_rekha',  'Rekha Sharma',   (SELECT id FROM public.wards WHERE geojson_id='ward_14'), 18,  2, 14, true)
ON CONFLICT (clerk_user_id) DO UPDATE SET
  name             = EXCLUDED.name,
  ward_id          = EXCLUDED.ward_id,
  score            = EXCLUDED.score,
  resolution_count = EXCLUDED.resolution_count,
  escalation_count = EXCLUDED.escalation_count,
  verified         = EXCLUDED.verified;

-- ── 3. Issues + escalation events ───────────────────────────
DO $$
DECLARE
  -- Citizens
  v_c1 uuid := (SELECT id FROM public.citizens WHERE clerk_user_id = 'demo_citizen_seed');
  v_c2 uuid := (SELECT id FROM public.citizens WHERE clerk_user_id = 'demo_c2');
  v_c3 uuid := (SELECT id FROM public.citizens WHERE clerk_user_id = 'demo_c3');
  v_c4 uuid := (SELECT id FROM public.citizens WHERE clerk_user_id = 'demo_c4');
  v_c5 uuid := (SELECT id FROM public.citizens WHERE clerk_user_id = 'demo_c5');
  v_c6 uuid := (SELECT id FROM public.citizens WHERE clerk_user_id = 'demo_c6');
  v_c7 uuid := (SELECT id FROM public.citizens WHERE clerk_user_id = 'demo_c7');
  v_c8 uuid := (SELECT id FROM public.citizens WHERE clerk_user_id = 'demo_c8');
  -- Authorities
  v_priya  uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_priya');
  v_amit   uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_amit');
  v_neha   uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_neha');
  v_ravi   uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_ravi');
  v_sunita uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_sunita');
  v_anita  uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_anita');
  v_vikram uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_vikram');
  v_raj    uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_raj');
  v_arjun  uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_arjun');
  v_suresh uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_suresh');
  v_meena  uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_meena');
  v_deepak uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_deepak');
  v_kavita uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_kavita');
  v_pooja  uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_pooja');
  v_rekha  uuid := (SELECT id FROM public.authorities WHERE clerk_user_id = 'demo_rekha');
BEGIN

-- ════════════════════════════════════════════════════════════
-- WARD 1 — Arjun Mehta (score 63)
-- ════════════════════════════════════════════════════════════
  -- Resolved (original seed)
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_1'),v_arjun,
    'https://picsum.photos/seed/nagrik_i8/600/400','drainage','critical','resolved',
    'https://picsum.photos/seed/nagrik_r8/600/400',now()-interval'7d',now()-interval'5d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/nagrik_i8/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_1'),v_arjun,
    'https://picsum.photos/seed/nagrik_i9/600/400','streetlight','moderate','resolved',
    'https://picsum.photos/seed/nagrik_r9/600/400',now()-interval'15d',now()-interval'12d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/nagrik_i9/600/400');

  -- Resolved (new)
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_1'),v_arjun,
    'https://picsum.photos/seed/ni13/600/400','garbage','moderate','resolved',
    'https://picsum.photos/seed/nr12/600/400',now()-interval'40d',now()-interval'36d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni13/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_1'),v_arjun,
    'https://picsum.photos/seed/ni14/600/400','pothole','critical','resolved',
    'https://picsum.photos/seed/nr13/600/400',now()-interval'32d',now()-interval'28d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni14/600/400');

  -- In progress
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_1'),v_arjun,
    'https://picsum.photos/seed/ni15/600/400','drainage','moderate','in_progress',now()-interval'10d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni15/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_1'),v_arjun,
    'https://picsum.photos/seed/ni16/600/400','streetlight','minor','in_progress',now()-interval'8d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni16/600/400');

  -- Pending
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_1'),v_arjun,
    'https://picsum.photos/seed/ni17/600/400','garbage','moderate','pending',now()-interval'5d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni17/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_1'),v_arjun,
    'https://picsum.photos/seed/ni18/600/400','pothole','critical','pending',now()-interval'3d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni18/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_1'),v_arjun,
    'https://picsum.photos/seed/ni19/600/400','garbage','minor','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni19/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 2 — Amit Gupta (score 88)
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_2'),v_amit,
    'https://picsum.photos/seed/ni20/600/400','garbage','moderate','resolved',
    'https://picsum.photos/seed/nr14/600/400',now()-interval'42d',now()-interval'38d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni20/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_2'),v_amit,
    'https://picsum.photos/seed/ni21/600/400','pothole','critical','resolved',
    'https://picsum.photos/seed/nr15/600/400',now()-interval'35d',now()-interval'31d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni21/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_2'),v_amit,
    'https://picsum.photos/seed/ni22/600/400','drainage','moderate','resolved',
    'https://picsum.photos/seed/nr16/600/400',now()-interval'28d',now()-interval'24d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni22/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_2'),v_amit,
    'https://picsum.photos/seed/ni23/600/400','streetlight','minor','resolved',
    'https://picsum.photos/seed/nr17/600/400',now()-interval'20d',now()-interval'17d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni23/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_2'),v_amit,
    'https://picsum.photos/seed/ni24/600/400','garbage','moderate','in_progress',now()-interval'12d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni24/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_2'),v_amit,
    'https://picsum.photos/seed/ni25/600/400','pothole','moderate','in_progress',now()-interval'9d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni25/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_2'),v_amit,
    'https://picsum.photos/seed/ni26/600/400','drainage','critical','pending',now()-interval'4d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni26/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_2'),v_amit,
    'https://picsum.photos/seed/ni27/600/400','garbage','minor','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni27/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_2'),v_amit,
    'https://picsum.photos/seed/ni28/600/400','streetlight','moderate','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni28/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 3 — Priya Sharma (score 92)
-- ════════════════════════════════════════════════════════════
  -- Original seed issues
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_3'),v_priya,
    'https://picsum.photos/seed/nagrik_i1/600/400','garbage','moderate','resolved',
    'https://picsum.photos/seed/nagrik_r1/600/400',now()-interval'5d',now()-interval'3d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/nagrik_i1/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_3'),v_priya,
    'https://picsum.photos/seed/nagrik_i2/600/400','pothole','critical','resolved',
    'https://picsum.photos/seed/nagrik_r2/600/400',now()-interval'8d',now()-interval'5d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/nagrik_i2/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_3'),v_priya,
    'https://picsum.photos/seed/nagrik_i3/600/400','streetlight','minor','resolved',
    'https://picsum.photos/seed/nagrik_r3/600/400',now()-interval'12d',now()-interval'9d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/nagrik_i3/600/400');

  -- New resolved
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_3'),v_priya,
    'https://picsum.photos/seed/ni29/600/400','pothole','moderate','resolved',
    'https://picsum.photos/seed/nr18/600/400',now()-interval'45d',now()-interval'40d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni29/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_3'),v_priya,
    'https://picsum.photos/seed/ni30/600/400','drainage','minor','resolved',
    'https://picsum.photos/seed/nr19/600/400',now()-interval'38d',now()-interval'33d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni30/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_3'),v_priya,
    'https://picsum.photos/seed/ni31/600/400','garbage','critical','in_progress',now()-interval'11d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni31/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_3'),v_priya,
    'https://picsum.photos/seed/ni32/600/400','streetlight','minor','in_progress',now()-interval'7d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni32/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_3'),v_priya,
    'https://picsum.photos/seed/ni33/600/400','pothole','moderate','pending',now()-interval'4d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni33/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_3'),v_priya,
    'https://picsum.photos/seed/ni34/600/400','garbage','minor','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni34/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_3'),v_priya,
    'https://picsum.photos/seed/ni35/600/400','drainage','moderate','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni35/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 4 — Neha Joshi (score 83)
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_4'),v_neha,
    'https://picsum.photos/seed/ni36/600/400','garbage','critical','resolved',
    'https://picsum.photos/seed/nr20/600/400',now()-interval'40d',now()-interval'36d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni36/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_4'),v_neha,
    'https://picsum.photos/seed/ni37/600/400','pothole','moderate','resolved',
    'https://picsum.photos/seed/nr21/600/400',now()-interval'33d',now()-interval'29d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni37/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_4'),v_neha,
    'https://picsum.photos/seed/ni38/600/400','drainage','critical','resolved',
    'https://picsum.photos/seed/nr22/600/400',now()-interval'25d',now()-interval'21d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni38/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_4'),v_neha,
    'https://picsum.photos/seed/ni39/600/400','streetlight','minor','resolved',
    'https://picsum.photos/seed/nr23/600/400',now()-interval'18d',now()-interval'15d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni39/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_4'),v_neha,
    'https://picsum.photos/seed/ni40/600/400','garbage','moderate','in_progress',now()-interval'10d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni40/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_4'),v_neha,
    'https://picsum.photos/seed/ni41/600/400','pothole','critical','in_progress',now()-interval'7d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni41/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_4'),v_neha,
    'https://picsum.photos/seed/ni42/600/400','drainage','minor','pending',now()-interval'3d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni42/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_4'),v_neha,
    'https://picsum.photos/seed/ni43/600/400','streetlight','moderate','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni43/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_4'),v_neha,
    'https://picsum.photos/seed/ni44/600/400','garbage','critical','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni44/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 5 — Kavita Singh (score 32) — neglected ward
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_5'),v_kavita,
    'https://picsum.photos/seed/nagrik_i10/600/400','garbage','critical','resolved',
    'https://picsum.photos/seed/nagrik_r10/600/400',now()-interval'3d',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/nagrik_i10/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_5'),v_kavita,
    'https://picsum.photos/seed/nagrik_i11/600/400','pothole','moderate','resolved',
    'https://picsum.photos/seed/nagrik_r11/600/400',now()-interval'11d',now()-interval'9d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/nagrik_i11/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_5'),v_kavita,
    'https://picsum.photos/seed/ni45/600/400','garbage','critical','resolved',
    'https://picsum.photos/seed/nr24/600/400',now()-interval'44d',now()-interval'39d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni45/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_5'),v_kavita,
    'https://picsum.photos/seed/ni46/600/400','pothole','critical','resolved',
    'https://picsum.photos/seed/nr25/600/400',now()-interval'37d',now()-interval'32d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni46/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_5'),v_kavita,
    'https://picsum.photos/seed/ni47/600/400','drainage','critical','in_progress',now()-interval'14d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni47/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_5'),v_kavita,
    'https://picsum.photos/seed/ni48/600/400','garbage','critical','in_progress',now()-interval'11d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni48/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_5'),v_kavita,
    'https://picsum.photos/seed/ni49/600/400','pothole','critical','pending',now()-interval'6d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni49/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_5'),v_kavita,
    'https://picsum.photos/seed/ni50/600/400','drainage','critical','pending',now()-interval'4d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni50/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_5'),v_kavita,
    'https://picsum.photos/seed/ni51/600/400','garbage','critical','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni51/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_5'),v_kavita,
    'https://picsum.photos/seed/ni52/600/400','streetlight','moderate','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni52/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 6 — Raj Patel (score 67)
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_6'),v_raj,
    'https://picsum.photos/seed/ni53/600/400','garbage','moderate','resolved',
    'https://picsum.photos/seed/nr26/600/400',now()-interval'36d',now()-interval'32d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni53/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_6'),v_raj,
    'https://picsum.photos/seed/ni54/600/400','pothole','moderate','resolved',
    'https://picsum.photos/seed/nr27/600/400',now()-interval'28d',now()-interval'24d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni54/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_6'),v_raj,
    'https://picsum.photos/seed/ni55/600/400','drainage','minor','resolved',
    'https://picsum.photos/seed/nr28/600/400',now()-interval'20d',now()-interval'16d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni55/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_6'),v_raj,
    'https://picsum.photos/seed/ni56/600/400','streetlight','moderate','in_progress',now()-interval'9d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni56/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_6'),v_raj,
    'https://picsum.photos/seed/ni57/600/400','garbage','critical','in_progress',now()-interval'6d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni57/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_6'),v_raj,
    'https://picsum.photos/seed/ni58/600/400','pothole','moderate','pending',now()-interval'3d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni58/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_6'),v_raj,
    'https://picsum.photos/seed/ni59/600/400','drainage','minor','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni59/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_6'),v_raj,
    'https://picsum.photos/seed/ni60/600/400','garbage','minor','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni60/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 7 — Meena Rawat (score 48)
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_7'),v_meena,
    'https://picsum.photos/seed/ni61/600/400','garbage','critical','resolved',
    'https://picsum.photos/seed/nr29/600/400',now()-interval'41d',now()-interval'37d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni61/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_7'),v_meena,
    'https://picsum.photos/seed/ni62/600/400','drainage','critical','resolved',
    'https://picsum.photos/seed/nr30/600/400',now()-interval'30d',now()-interval'25d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni62/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_7'),v_meena,
    'https://picsum.photos/seed/ni63/600/400','pothole','critical','in_progress',now()-interval'13d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni63/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_7'),v_meena,
    'https://picsum.photos/seed/ni64/600/400','garbage','critical','in_progress',now()-interval'10d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni64/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_7'),v_meena,
    'https://picsum.photos/seed/ni65/600/400','drainage','critical','in_progress',now()-interval'7d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni65/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_7'),v_meena,
    'https://picsum.photos/seed/ni66/600/400','pothole','moderate','pending',now()-interval'5d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni66/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_7'),v_meena,
    'https://picsum.photos/seed/ni67/600/400','garbage','critical','pending',now()-interval'3d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni67/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_7'),v_meena,
    'https://picsum.photos/seed/ni68/600/400','streetlight','minor','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni68/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_7'),v_meena,
    'https://picsum.photos/seed/ni69/600/400','drainage','critical','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni69/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 8 — Ravi Kumar (score 81)
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_8'),v_ravi,
    'https://picsum.photos/seed/nagrik_i4/600/400','drainage','moderate','resolved',
    'https://picsum.photos/seed/nagrik_r4/600/400',now()-interval'6d',now()-interval'4d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/nagrik_i4/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_8'),v_ravi,
    'https://picsum.photos/seed/nagrik_i5/600/400','garbage','critical','resolved',
    'https://picsum.photos/seed/nagrik_r5/600/400',now()-interval'10d',now()-interval'7d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/nagrik_i5/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_8'),v_ravi,
    'https://picsum.photos/seed/ni70/600/400','garbage','moderate','resolved',
    'https://picsum.photos/seed/nr31/600/400',now()-interval'43d',now()-interval'39d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni70/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_8'),v_ravi,
    'https://picsum.photos/seed/ni71/600/400','streetlight','minor','resolved',
    'https://picsum.photos/seed/nr32/600/400',now()-interval'34d',now()-interval'30d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni71/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_8'),v_ravi,
    'https://picsum.photos/seed/ni72/600/400','pothole','critical','resolved',
    'https://picsum.photos/seed/nr33/600/400',now()-interval'22d',now()-interval'18d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni72/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_8'),v_ravi,
    'https://picsum.photos/seed/ni73/600/400','drainage','moderate','in_progress',now()-interval'11d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni73/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_8'),v_ravi,
    'https://picsum.photos/seed/ni74/600/400','garbage','minor','in_progress',now()-interval'8d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni74/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_8'),v_ravi,
    'https://picsum.photos/seed/ni75/600/400','pothole','moderate','pending',now()-interval'4d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni75/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_8'),v_ravi,
    'https://picsum.photos/seed/ni76/600/400','drainage','minor','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni76/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_8'),v_ravi,
    'https://picsum.photos/seed/ni77/600/400','garbage','moderate','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni77/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 9 — Vikram Singh (score 72)
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_9'),v_vikram,
    'https://picsum.photos/seed/ni78/600/400','pothole','moderate','resolved',
    'https://picsum.photos/seed/nr34/600/400',now()-interval'39d',now()-interval'35d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni78/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_9'),v_vikram,
    'https://picsum.photos/seed/ni79/600/400','garbage','critical','resolved',
    'https://picsum.photos/seed/nr35/600/400',now()-interval'30d',now()-interval'25d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni79/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_9'),v_vikram,
    'https://picsum.photos/seed/ni80/600/400','streetlight','moderate','resolved',
    'https://picsum.photos/seed/nr36/600/400',now()-interval'22d',now()-interval'18d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni80/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_9'),v_vikram,
    'https://picsum.photos/seed/ni81/600/400','drainage','moderate','in_progress',now()-interval'10d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni81/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_9'),v_vikram,
    'https://picsum.photos/seed/ni82/600/400','pothole','minor','in_progress',now()-interval'7d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni82/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_9'),v_vikram,
    'https://picsum.photos/seed/ni83/600/400','garbage','moderate','pending',now()-interval'4d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni83/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_9'),v_vikram,
    'https://picsum.photos/seed/ni84/600/400','streetlight','minor','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni84/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_9'),v_vikram,
    'https://picsum.photos/seed/ni85/600/400','drainage','critical','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni85/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 10 — Pooja Sharma (score 28) — accountability target
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_10'),v_pooja,
    'https://picsum.photos/seed/ni86/600/400','drainage','critical','resolved',
    'https://picsum.photos/seed/nr37/600/400',now()-interval'45d',now()-interval'40d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni86/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_10'),v_pooja,
    'https://picsum.photos/seed/ni87/600/400','garbage','critical','resolved',
    'https://picsum.photos/seed/nr38/600/400',now()-interval'38d',now()-interval'33d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni87/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_10'),v_pooja,
    'https://picsum.photos/seed/ni88/600/400','pothole','critical','in_progress',now()-interval'15d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni88/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_10'),v_pooja,
    'https://picsum.photos/seed/ni89/600/400','drainage','critical','in_progress',now()-interval'12d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni89/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_10'),v_pooja,
    'https://picsum.photos/seed/ni90/600/400','garbage','critical','pending',now()-interval'7d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni90/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_10'),v_pooja,
    'https://picsum.photos/seed/ni91/600/400','pothole','critical','pending',now()-interval'4d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni91/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_10'),v_pooja,
    'https://picsum.photos/seed/ni92/600/400','streetlight','moderate','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni92/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_10'),v_pooja,
    'https://picsum.photos/seed/ni93/600/400','drainage','critical','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni93/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 11 — Suresh Kumar (score 61)
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_11'),v_suresh,
    'https://picsum.photos/seed/ni94/600/400','garbage','moderate','resolved',
    'https://picsum.photos/seed/nr39/600/400',now()-interval'37d',now()-interval'33d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni94/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_11'),v_suresh,
    'https://picsum.photos/seed/ni95/600/400','pothole','moderate','resolved',
    'https://picsum.photos/seed/nr40/600/400',now()-interval'28d',now()-interval'24d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni95/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_11'),v_suresh,
    'https://picsum.photos/seed/ni96/600/400','drainage','minor','resolved',
    'https://picsum.photos/seed/nr41/600/400',now()-interval'20d',now()-interval'16d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni96/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_11'),v_suresh,
    'https://picsum.photos/seed/ni97/600/400','streetlight','moderate','in_progress',now()-interval'9d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni97/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_11'),v_suresh,
    'https://picsum.photos/seed/ni98/600/400','garbage','critical','in_progress',now()-interval'6d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni98/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_11'),v_suresh,
    'https://picsum.photos/seed/ni99/600/400','pothole','minor','pending',now()-interval'3d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni99/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_11'),v_suresh,
    'https://picsum.photos/seed/ni100/600/400','drainage','moderate','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni100/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_11'),v_suresh,
    'https://picsum.photos/seed/ni101/600/400','garbage','minor','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni101/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 12 — Anita Verma (score 74)
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_12'),v_anita,
    'https://picsum.photos/seed/ni102/600/400','pothole','moderate','resolved',
    'https://picsum.photos/seed/nr42/600/400',now()-interval'40d',now()-interval'36d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni102/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_12'),v_anita,
    'https://picsum.photos/seed/ni103/600/400','garbage','moderate','resolved',
    'https://picsum.photos/seed/nr43/600/400',now()-interval'32d',now()-interval'28d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni103/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_12'),v_anita,
    'https://picsum.photos/seed/ni104/600/400','streetlight','minor','resolved',
    'https://picsum.photos/seed/nr44/600/400',now()-interval'23d',now()-interval'19d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni104/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_12'),v_anita,
    'https://picsum.photos/seed/ni105/600/400','drainage','moderate','in_progress',now()-interval'11d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni105/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_12'),v_anita,
    'https://picsum.photos/seed/ni106/600/400','pothole','minor','in_progress',now()-interval'7d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni106/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_12'),v_anita,
    'https://picsum.photos/seed/ni107/600/400','garbage','moderate','pending',now()-interval'4d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni107/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_12'),v_anita,
    'https://picsum.photos/seed/ni108/600/400','streetlight','critical','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni108/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_12'),v_anita,
    'https://picsum.photos/seed/ni109/600/400','drainage','minor','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni109/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 13 — Deepak Jain (score 43)
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_13'),v_deepak,
    'https://picsum.photos/seed/ni110/600/400','garbage','critical','resolved',
    'https://picsum.photos/seed/nr45/600/400',now()-interval'42d',now()-interval'37d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni110/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_13'),v_deepak,
    'https://picsum.photos/seed/ni111/600/400','pothole','critical','resolved',
    'https://picsum.photos/seed/nr46/600/400',now()-interval'34d',now()-interval'29d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni111/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_13'),v_deepak,
    'https://picsum.photos/seed/ni112/600/400','drainage','critical','in_progress',now()-interval'14d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni112/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_13'),v_deepak,
    'https://picsum.photos/seed/ni113/600/400','garbage','critical','in_progress',now()-interval'9d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni113/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_13'),v_deepak,
    'https://picsum.photos/seed/ni114/600/400','pothole','critical','pending',now()-interval'5d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni114/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_13'),v_deepak,
    'https://picsum.photos/seed/ni115/600/400','drainage','critical','pending',now()-interval'3d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni115/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_13'),v_deepak,
    'https://picsum.photos/seed/ni116/600/400','garbage','critical','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni116/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_13'),v_deepak,
    'https://picsum.photos/seed/ni117/600/400','streetlight','moderate','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni117/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 14 — Rekha Sharma (score 18) — worst performer
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_14'),v_rekha,
    'https://picsum.photos/seed/ni118/600/400','garbage','critical','resolved',
    'https://picsum.photos/seed/nr47/600/400',now()-interval'44d',now()-interval'39d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni118/600/400');

  -- Stale in_progress — been sitting for 20+ days
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_14'),v_rekha,
    'https://picsum.photos/seed/ni119/600/400','pothole','critical','in_progress',now()-interval'20d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni119/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_14'),v_rekha,
    'https://picsum.photos/seed/ni120/600/400','drainage','critical','in_progress',now()-interval'17d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni120/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_14'),v_rekha,
    'https://picsum.photos/seed/ni121/600/400','garbage','critical','pending',now()-interval'14d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni121/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_14'),v_rekha,
    'https://picsum.photos/seed/ni122/600/400','pothole','critical','pending',now()-interval'10d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni122/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_14'),v_rekha,
    'https://picsum.photos/seed/ni123/600/400','drainage','critical','pending',now()-interval'7d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni123/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_14'),v_rekha,
    'https://picsum.photos/seed/ni124/600/400','garbage','critical','pending',now()-interval'4d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni124/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_14'),v_rekha,
    'https://picsum.photos/seed/ni125/600/400','streetlight','moderate','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni125/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_14'),v_rekha,
    'https://picsum.photos/seed/ni126/600/400','pothole','critical','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni126/600/400');

-- ════════════════════════════════════════════════════════════
-- WARD 17 — Sunita Verma (score 75)
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_17'),v_sunita,
    'https://picsum.photos/seed/nagrik_i6/600/400','pothole','moderate','resolved',
    'https://picsum.photos/seed/nagrik_r6/600/400',now()-interval'4d',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/nagrik_i6/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_17'),v_sunita,
    'https://picsum.photos/seed/nagrik_i7/600/400','garbage','minor','resolved',
    'https://picsum.photos/seed/nagrik_r7/600/400',now()-interval'9d',now()-interval'7d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/nagrik_i7/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_17'),v_sunita,
    'https://picsum.photos/seed/ni127/600/400','pothole','moderate','resolved',
    'https://picsum.photos/seed/nr48/600/400',now()-interval'41d',now()-interval'37d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni127/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,resolution_photo_url,created_at,resolved_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_17'),v_sunita,
    'https://picsum.photos/seed/ni128/600/400','streetlight','minor','resolved',
    'https://picsum.photos/seed/nr49/600/400',now()-interval'30d',now()-interval'26d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni128/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_17'),v_sunita,
    'https://picsum.photos/seed/ni129/600/400','drainage','moderate','in_progress',now()-interval'9d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni129/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_17'),v_sunita,
    'https://picsum.photos/seed/ni130/600/400','garbage','critical','in_progress',now()-interval'6d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni130/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_17'),v_sunita,
    'https://picsum.photos/seed/ni131/600/400','pothole','minor','pending',now()-interval'3d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni131/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_17'),v_sunita,
    'https://picsum.photos/seed/ni132/600/400','garbage','moderate','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni132/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,authority_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_17'),v_sunita,
    'https://picsum.photos/seed/ni133/600/400','drainage','minor','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni133/600/400');

-- ════════════════════════════════════════════════════════════
-- WARDS 15, 16, 18, 19, 20 — no assigned authority (pending only)
-- ════════════════════════════════════════════════════════════
  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_15'),
    'https://picsum.photos/seed/nagrik_i12/600/400','garbage','critical','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/nagrik_i12/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_15'),
    'https://picsum.photos/seed/ni134/600/400','pothole','critical','pending',now()-interval'5d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni134/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_15'),
    'https://picsum.photos/seed/ni135/600/400','drainage','critical','pending',now()-interval'3d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni135/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_16'),
    'https://picsum.photos/seed/ni136/600/400','garbage','moderate','pending',now()-interval'4d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni136/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_16'),
    'https://picsum.photos/seed/ni137/600/400','pothole','minor','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni137/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_16'),
    'https://picsum.photos/seed/ni138/600/400','drainage','moderate','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni138/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_18'),
    'https://picsum.photos/seed/ni139/600/400','streetlight','minor','pending',now()-interval'3d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni139/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c8,(SELECT id FROM public.wards WHERE geojson_id='ward_18'),
    'https://picsum.photos/seed/ni140/600/400','garbage','moderate','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni140/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c1,(SELECT id FROM public.wards WHERE geojson_id='ward_18'),
    'https://picsum.photos/seed/ni141/600/400','pothole','minor','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni141/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c2,(SELECT id FROM public.wards WHERE geojson_id='ward_19'),
    'https://picsum.photos/seed/ni142/600/400','drainage','critical','pending',now()-interval'5d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni142/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c3,(SELECT id FROM public.wards WHERE geojson_id='ward_19'),
    'https://picsum.photos/seed/ni143/600/400','garbage','critical','pending',now()-interval'3d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni143/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c4,(SELECT id FROM public.wards WHERE geojson_id='ward_19'),
    'https://picsum.photos/seed/ni144/600/400','pothole','critical','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni144/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c5,(SELECT id FROM public.wards WHERE geojson_id='ward_20'),
    'https://picsum.photos/seed/ni145/600/400','garbage','minor','pending',now()-interval'4d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni145/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c6,(SELECT id FROM public.wards WHERE geojson_id='ward_20'),
    'https://picsum.photos/seed/ni146/600/400','streetlight','minor','pending',now()-interval'2d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni146/600/400');

  INSERT INTO public.issues (citizen_id,ward_id,photo_url,ai_category,ai_severity,status,created_at)
  SELECT v_c7,(SELECT id FROM public.wards WHERE geojson_id='ward_20'),
    'https://picsum.photos/seed/ni147/600/400','pothole','moderate','pending',now()-interval'1d'
  WHERE NOT EXISTS(SELECT 1 FROM public.issues WHERE photo_url='https://picsum.photos/seed/ni147/600/400');

-- ════════════════════════════════════════════════════════════
-- ESCALATION EVENTS
-- Resolution events for top/middle authorities
-- Escalation events for struggling/bottom authorities
-- ════════════════════════════════════════════════════════════

  -- ── Priya (ward_3, score 92) — resolution events
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_priya,'resolution',10,now()-interval'3d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/nagrik_i1/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_priya,'resolution',8,now()-interval'5d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/nagrik_i2/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_priya,'resolution',9,now()-interval'9d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/nagrik_i3/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_priya,'resolution',10,now()-interval'40d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni29/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_priya,'resolution',9,now()-interval'33d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni30/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  -- ── Amit (ward_2, score 88) — resolution events
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_amit,'resolution',9,now()-interval'38d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni20/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_amit,'resolution',10,now()-interval'31d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni21/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_amit,'resolution',8,now()-interval'24d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni22/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_amit,'resolution',9,now()-interval'17d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni23/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  -- ── Neha (ward_4, score 83) — resolution events
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_neha,'resolution',8,now()-interval'36d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni36/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_neha,'resolution',9,now()-interval'29d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni37/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_neha,'resolution',10,now()-interval'21d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni38/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_neha,'resolution',7,now()-interval'15d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni39/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  -- ── Ravi (ward_8, score 81) — resolution events
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_ravi,'resolution',8,now()-interval'4d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/nagrik_i4/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_ravi,'resolution',9,now()-interval'7d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/nagrik_i5/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_ravi,'resolution',8,now()-interval'39d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni70/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_ravi,'resolution',7,now()-interval'18d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni72/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  -- ── Vikram (ward_9, score 72) — resolution events
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_vikram,'resolution',7,now()-interval'35d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni78/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_vikram,'resolution',8,now()-interval'25d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni79/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  -- ── Sunita (ward_17, score 75) — resolution events
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_sunita,'resolution',7,now()-interval'37d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni127/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_sunita,'resolution',6,now()-interval'26d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni128/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  -- ── Anita (ward_12, score 74) — resolution events
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_anita,'resolution',7,now()-interval'36d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni102/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_anita,'resolution',8,now()-interval'28d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni103/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_anita,'resolution',6,now()-interval'19d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni104/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  -- ── Arjun (ward_1, score 63) — mix
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_arjun,'resolution',6,now()-interval'36d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni13/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_arjun,'escalation',-6,now()-interval'5d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni15/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  -- ── Suresh (ward_11, score 61) — mix
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_suresh,'resolution',6,now()-interval'33d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni94/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_suresh,'escalation',-6,now()-interval'4d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni97/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  -- ── Meena (ward_7, score 48) — mostly escalations
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_meena,'resolution',5,now()-interval'37d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni61/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_meena,'escalation',-8,now()-interval'8d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni63/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_meena,'escalation',-7,now()-interval'6d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni64/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  -- ── Deepak (ward_13, score 43) — mostly escalations
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_deepak,'resolution',5,now()-interval'37d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni110/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_deepak,'escalation',-7,now()-interval'9d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni112/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_deepak,'escalation',-6,now()-interval'5d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni113/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  -- ── Kavita (ward_5, score 32) — bad performer
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_kavita,'resolution',4,now()-interval'39d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni45/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_kavita,'escalation',-9,now()-interval'9d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni47/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_kavita,'escalation',-8,now()-interval'7d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni48/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_kavita,'escalation',-9,now()-interval'3d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni49/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  -- ── Pooja (ward_10, score 28) — accountability target
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_pooja,'resolution',4,now()-interval'40d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni86/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='resolution');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_pooja,'escalation',-10,now()-interval'10d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni88/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_pooja,'escalation',-9,now()-interval'8d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni89/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_pooja,'escalation',-8,now()-interval'3d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni90/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  -- ── Rekha (ward_14, score 18) — worst — all escalations
  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_rekha,'escalation',-10,now()-interval'15d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni119/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_rekha,'escalation',-10,now()-interval'12d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni120/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_rekha,'escalation',-9,now()-interval'9d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni121/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

  INSERT INTO public.escalation_events (issue_id,authority_id,event_type,score_delta,created_at)
  SELECT i.id,v_rekha,'escalation',-8,now()-interval'6d' FROM public.issues i
  WHERE i.photo_url='https://picsum.photos/seed/ni122/600/400'
    AND NOT EXISTS(SELECT 1 FROM public.escalation_events e WHERE e.issue_id=i.id AND e.event_type='escalation');

END $$;

-- ── 4. Ward scores — full spectrum for a vivid map ───────────
UPDATE public.wards SET score = 92 WHERE geojson_id = 'ward_3';   -- Priya territory
UPDATE public.wards SET score = 88 WHERE geojson_id = 'ward_2';   -- Amit territory
UPDATE public.wards SET score = 83 WHERE geojson_id = 'ward_4';   -- Neha territory
UPDATE public.wards SET score = 81 WHERE geojson_id = 'ward_8';   -- Ravi territory
UPDATE public.wards SET score = 75 WHERE geojson_id = 'ward_17';  -- Sunita territory
UPDATE public.wards SET score = 74 WHERE geojson_id = 'ward_12';  -- Anita territory
UPDATE public.wards SET score = 72 WHERE geojson_id = 'ward_9';   -- Vikram territory
UPDATE public.wards SET score = 67 WHERE geojson_id = 'ward_6';   -- Raj territory
UPDATE public.wards SET score = 63 WHERE geojson_id = 'ward_1';   -- Arjun territory
UPDATE public.wards SET score = 61 WHERE geojson_id = 'ward_11';  -- Suresh territory
UPDATE public.wards SET score = 55 WHERE geojson_id = 'ward_16';  -- Unassigned, moderate
UPDATE public.wards SET score = 48 WHERE geojson_id = 'ward_7';   -- Meena territory
UPDATE public.wards SET score = 43 WHERE geojson_id = 'ward_13';  -- Deepak territory
UPDATE public.wards SET score = 42 WHERE geojson_id = 'ward_19';  -- Unassigned, struggling
UPDATE public.wards SET score = 38 WHERE geojson_id = 'ward_20';  -- Unassigned
UPDATE public.wards SET score = 35 WHERE geojson_id = 'ward_18';  -- Unassigned
UPDATE public.wards SET score = 32 WHERE geojson_id = 'ward_5';   -- Kavita territory
UPDATE public.wards SET score = 28 WHERE geojson_id = 'ward_10';  -- Pooja territory
UPDATE public.wards SET score = 25 WHERE geojson_id = 'ward_15';  -- No authority, critical
UPDATE public.wards SET score = 18 WHERE geojson_id = 'ward_14';  -- Rekha territory (worst)
