-- ============================================================
-- Nagrik — Migration 003: Waste Segregation Feature
-- Run in Supabase SQL Editor AFTER schema.sql and authorities.sql
-- ============================================================

-- ── EXTEND WARDS ──────────────────────────────────────────────────────────────
ALTER TABLE public.wards
  ADD COLUMN IF NOT EXISTS recycling_rate numeric(5,2) NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS zone text NOT NULL DEFAULT 'Central';

-- Seed zones for existing 20 wards
UPDATE public.wards SET zone = 'West'       WHERE geojson_id = 'ward_1';
UPDATE public.wards SET zone = 'West'       WHERE geojson_id = 'ward_2';
UPDATE public.wards SET zone = 'South'      WHERE geojson_id = 'ward_3';
UPDATE public.wards SET zone = 'South'      WHERE geojson_id = 'ward_4';
UPDATE public.wards SET zone = 'South-West' WHERE geojson_id = 'ward_5';
UPDATE public.wards SET zone = 'North'      WHERE geojson_id = 'ward_6';
UPDATE public.wards SET zone = 'Central'    WHERE geojson_id = 'ward_7';
UPDATE public.wards SET zone = 'Central'    WHERE geojson_id = 'ward_8';
UPDATE public.wards SET zone = 'Central'    WHERE geojson_id = 'ward_9';
UPDATE public.wards SET zone = 'West'       WHERE geojson_id = 'ward_10';
UPDATE public.wards SET zone = 'North'      WHERE geojson_id = 'ward_11';
UPDATE public.wards SET zone = 'North-East' WHERE geojson_id = 'ward_12';
UPDATE public.wards SET zone = 'Central'    WHERE geojson_id = 'ward_13';
UPDATE public.wards SET zone = 'South'      WHERE geojson_id = 'ward_14';
UPDATE public.wards SET zone = 'South-East' WHERE geojson_id = 'ward_15';
UPDATE public.wards SET zone = 'South'      WHERE geojson_id = 'ward_16';
UPDATE public.wards SET zone = 'North'      WHERE geojson_id = 'ward_17';
UPDATE public.wards SET zone = 'East'       WHERE geojson_id = 'ward_18';
UPDATE public.wards SET zone = 'North'      WHERE geojson_id = 'ward_19';
UPDATE public.wards SET zone = 'Central'    WHERE geojson_id = 'ward_20';

-- ── EXTEND CITIZENS ───────────────────────────────────────────────────────────
ALTER TABLE public.citizens
  ADD COLUMN IF NOT EXISTS name       text,
  ADD COLUMN IF NOT EXISTS phone      text,
  ADD COLUMN IF NOT EXISTS eco_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ward_id    uuid REFERENCES public.wards(id) ON DELETE SET NULL;

-- ── EXTEND AUTHORITIES (= Collectors in new UI) ───────────────────────────────
ALTER TABLE public.authorities
  ADD COLUMN IF NOT EXISTS vehicle_number text,
  ADD COLUMN IF NOT EXISTS employee_id   text,
  ADD COLUMN IF NOT EXISTS on_duty       boolean NOT NULL DEFAULT false;

-- ── WASTE SCANS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.waste_scans (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id    uuid REFERENCES public.citizens(id) ON DELETE CASCADE,
  ward_id       uuid REFERENCES public.wards(id) ON DELETE SET NULL,
  collector_id  uuid REFERENCES public.authorities(id) ON DELETE SET NULL,
  photo_url     text NOT NULL,
  waste_type    text NOT NULL,
  recyclable    boolean NOT NULL DEFAULT false,
  bin_color     text NOT NULL DEFAULT 'grey',
  prep_steps    text[] NOT NULL DEFAULT '{}',
  tip           text,
  points_earned integer NOT NULL DEFAULT 0,
  pickup_status text NOT NULL DEFAULT 'pending',
  collected_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.waste_scans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "waste_scans_citizen_read" ON public.waste_scans FOR SELECT
    USING (citizen_id IN (SELECT id FROM public.citizens WHERE clerk_user_id = auth.uid()::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "waste_scans_citizen_insert" ON public.waste_scans FOR INSERT
    WITH CHECK (citizen_id IN (SELECT id FROM public.citizens WHERE clerk_user_id = auth.uid()::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "waste_scans_collector_read" ON public.waste_scans FOR SELECT
    USING (ward_id IN (SELECT ward_id FROM public.authorities WHERE clerk_user_id = auth.uid()::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "waste_scans_collector_update" ON public.waste_scans FOR UPDATE
    USING (ward_id IN (SELECT ward_id FROM public.authorities WHERE clerk_user_id = auth.uid()::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── RECYCLING CENTERS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recycling_centers (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              text NOT NULL UNIQUE,
  address           text NOT NULL,
  ward_id           uuid REFERENCES public.wards(id) ON DELETE SET NULL,
  lat               numeric(10,7) NOT NULL,
  lng               numeric(10,7) NOT NULL,
  phone             text,
  rating            numeric(2,1) DEFAULT 4.0,
  status            text NOT NULL DEFAULT 'open',
  hours             text,
  accepted_types    text[] DEFAULT '{}',
  total_collections integer DEFAULT 0,
  description       text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Backfill any missing columns if table was created in a prior partial run
ALTER TABLE public.recycling_centers ADD COLUMN IF NOT EXISTS phone             text;
ALTER TABLE public.recycling_centers ADD COLUMN IF NOT EXISTS rating            numeric(2,1) DEFAULT 4.0;
ALTER TABLE public.recycling_centers ADD COLUMN IF NOT EXISTS status            text NOT NULL DEFAULT 'open';
ALTER TABLE public.recycling_centers ADD COLUMN IF NOT EXISTS hours             text;
ALTER TABLE public.recycling_centers ADD COLUMN IF NOT EXISTS accepted_types    text[] DEFAULT '{}';
ALTER TABLE public.recycling_centers ADD COLUMN IF NOT EXISTS total_collections integer DEFAULT 0;
ALTER TABLE public.recycling_centers ADD COLUMN IF NOT EXISTS description       text;

ALTER TABLE public.recycling_centers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "recycling_centers_public_read" ON public.recycling_centers FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── ROUTES ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.routes (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  collector_id      uuid REFERENCES public.authorities(id) ON DELETE CASCADE,
  name              text NOT NULL,
  ward_id           uuid REFERENCES public.wards(id) ON DELETE SET NULL,
  date              date NOT NULL DEFAULT CURRENT_DATE,
  status            text NOT NULL DEFAULT 'pending',
  distance_km       numeric(5,1),
  estimated_minutes integer,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "routes_collector_read" ON public.routes FOR SELECT
    USING (collector_id IN (SELECT id FROM public.authorities WHERE clerk_user_id = auth.uid()::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "routes_collector_update" ON public.routes FOR UPDATE
    USING (collector_id IN (SELECT id FROM public.authorities WHERE clerk_user_id = auth.uid()::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── ROUTE STOPS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.route_stops (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id   uuid REFERENCES public.routes(id) ON DELETE CASCADE,
  scan_id    uuid REFERENCES public.waste_scans(id) ON DELETE SET NULL,
  address    text NOT NULL,
  status     text NOT NULL DEFAULT 'pending',
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "route_stops_collector_read" ON public.route_stops FOR SELECT
    USING (route_id IN (
      SELECT id FROM public.routes
      WHERE collector_id IN (SELECT id FROM public.authorities WHERE clerk_user_id = auth.uid()::text)
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "route_stops_collector_update" ON public.route_stops FOR UPDATE
    USING (route_id IN (
      SELECT id FROM public.routes
      WHERE collector_id IN (SELECT id FROM public.authorities WHERE clerk_user_id = auth.uid()::text)
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── CITIZEN REQUESTS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.citizen_requests (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id   uuid REFERENCES public.citizens(id) ON DELETE CASCADE,
  collector_id uuid REFERENCES public.authorities(id) ON DELETE SET NULL,
  address      text NOT NULL,
  ward_id      uuid REFERENCES public.wards(id) ON DELETE SET NULL,
  waste_type   text NOT NULL,
  urgency      text NOT NULL DEFAULT 'medium',
  description  text,
  image_url    text,
  status       text NOT NULL DEFAULT 'open',
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.citizen_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "citizen_requests_citizen_read" ON public.citizen_requests FOR SELECT
    USING (citizen_id IN (SELECT id FROM public.citizens WHERE clerk_user_id = auth.uid()::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "citizen_requests_citizen_insert" ON public.citizen_requests FOR INSERT
    WITH CHECK (citizen_id IN (SELECT id FROM public.citizens WHERE clerk_user_id = auth.uid()::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "citizen_requests_collector_read" ON public.citizen_requests FOR SELECT
    USING (ward_id IN (SELECT ward_id FROM public.authorities WHERE clerk_user_id = auth.uid()::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "citizen_requests_collector_update" ON public.citizen_requests FOR UPDATE
    USING (ward_id IN (SELECT ward_id FROM public.authorities WHERE clerk_user_id = auth.uid()::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── STORAGE BUCKET: SCAN PHOTOS ───────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('scan-photos', 'scan-photos', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "scan_photos_upload" ON storage.objects FOR INSERT
    TO authenticated WITH CHECK (bucket_id = 'scan-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "scan_photos_public_read" ON storage.objects FOR SELECT
    USING (bucket_id = 'scan-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── REAL-TIME ─────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.waste_scans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.citizen_requests;

-- ============================================================
-- SEED DATA
-- ============================================================

-- ── RECYCLING CENTERS (10 centres across Jaipur) ─────────────────────────────
INSERT INTO public.recycling_centers
  (name, address, ward_id, lat, lng, phone, rating, status, hours, accepted_types, total_collections, description)
VALUES
  (
    'Mansarovar Green Hub',
    'Plot 14, Sector 5, Mansarovar',
    (SELECT id FROM public.wards WHERE geojson_id = 'ward_2'),
    26.8467, 75.7423, '+91 98765 43210', 4.8, 'open',
    '7:00 AM – 8:00 PM', ARRAY['Plastic', 'Paper', 'Glass', 'Metal'], 1240,
    'Jaipur''s flagship recycling hub with AI-assisted sorting and real-time capacity tracking.'
  ),
  (
    'Vaishali E-Waste Point',
    'Near D-Mart, Vaishali Nagar',
    (SELECT id FROM public.wards WHERE geojson_id = 'ward_1'),
    26.9124, 75.7391, '+91 98765 43211', 4.5, 'open',
    '9:00 AM – 6:00 PM', ARRAY['E-Waste', 'Batteries', 'Hazardous'], 870,
    'Specialised e-waste collection centre with certified disposal partners.'
  ),
  (
    'Jagatpura Compost Centre',
    'Near Railway Station, Jagatpura',
    (SELECT id FROM public.wards WHERE geojson_id = 'ward_4'),
    26.7941, 75.8234, '+91 98765 43212', 4.3, 'busy',
    '6:00 AM – 10:00 PM', ARRAY['Organic', 'Food Waste', 'Garden Waste'], 2100,
    'High-capacity organic waste processing with on-site composting facility.'
  ),
  (
    'Malviya Nagar Recycling Depot',
    'Sector 12, Malviya Nagar',
    (SELECT id FROM public.wards WHERE geojson_id = 'ward_3'),
    26.8312, 75.8012, '+91 98765 43213', 4.1, 'open',
    '8:00 AM – 7:00 PM', ARRAY['Plastic', 'Paper', 'Cardboard', 'Metal'], 980,
    'Full-service recycling depot serving South Jaipur with doorstep pickup available.'
  ),
  (
    'Sanganer Textile Recycler',
    'Industrial Area, Sanganer',
    (SELECT id FROM public.wards WHERE geojson_id = 'ward_5'),
    26.7823, 75.7612, '+91 98765 43214', 3.9, 'closed',
    '9:00 AM – 5:00 PM', ARRAY['Textiles', 'Clothing', 'Fabric'], 560,
    'Specialised textile recycling centre supporting Jaipur''s garment industry.'
  ),
  (
    'Pratap Nagar Multi-Waste Hub',
    'Near Bus Stand, Pratap Nagar',
    (SELECT id FROM public.wards WHERE geojson_id = 'ward_6'),
    26.8923, 75.7812, '+91 98765 43215', 4.6, 'open',
    '7:00 AM – 9:00 PM', ARRAY['All Types', 'Bulk Waste'], 1680,
    'Largest multi-waste collection hub in North Jaipur with 24/7 drop-off facility.'
  ),
  (
    'Civil Lines E-Waste Centre',
    'Near Rajasthan HC, Civil Lines',
    (SELECT id FROM public.wards WHERE geojson_id = 'ward_8'),
    26.9124, 75.7891, '+91 98765 43216', 4.7, 'open',
    '9:00 AM – 6:00 PM', ARRAY['E-Waste', 'Batteries', 'Metal'], 740,
    'Government-certified e-waste disposal for Central Jaipur residents.'
  ),
  (
    'Raja Park Paper Hub',
    'Shop 7, Raja Park Main Market',
    (SELECT id FROM public.wards WHERE geojson_id = 'ward_13'),
    26.8734, 75.8123, '+91 98765 43217', 4.2, 'open',
    '8:00 AM – 8:00 PM', ARRAY['Paper', 'Cardboard', 'Books', 'Magazines'], 1120,
    'Dedicated paper recycling unit partnered with local newspaper mills.'
  ),
  (
    'Vidhyadhar Nagar Green Centre',
    'Sector 6, Vidhyadhar Nagar',
    (SELECT id FROM public.wards WHERE geojson_id = 'ward_17'),
    26.9312, 75.7634, '+91 98765 43218', 4.4, 'open',
    '7:00 AM – 7:00 PM', ARRAY['Organic', 'Plastic', 'Glass', 'Metal'], 890,
    'Award-winning green centre with solar-powered operations and community workshops.'
  ),
  (
    'Shyam Nagar Composting Unit',
    'Block C, Shyam Nagar',
    (SELECT id FROM public.wards WHERE geojson_id = 'ward_12'),
    26.9023, 75.8012, '+91 98765 43219', 4.0, 'busy',
    '6:00 AM – 9:00 PM', ARRAY['Organic', 'Food Waste', 'Garden Waste'], 670,
    'Community composting unit converting 2 tonnes of organic waste daily into fertiliser.'
  )
ON CONFLICT (name) DO NOTHING;

-- ── DEMO WASTE SCANS (for seeded citizens, if any exist) ──────────────────────
-- Note: This inserts demo scans only if citizens with names exist.
-- Safe to run even when citizens table is empty.
DO $$
DECLARE
  demo_citizen_id uuid;
  demo_ward_id    uuid;
BEGIN
  SELECT c.id, c.ward_id INTO demo_citizen_id, demo_ward_id
  FROM public.citizens c WHERE c.name IS NOT NULL LIMIT 1;

  IF demo_citizen_id IS NULL THEN RETURN; END IF;

  INSERT INTO public.waste_scans
    (citizen_id, ward_id, photo_url, waste_type, recyclable, bin_color, prep_steps, tip, points_earned, pickup_status, created_at)
  VALUES
    (demo_citizen_id, demo_ward_id, 'https://placehold.co/400x400?text=Plastic', 'dry_plastic', true, 'blue', ARRAY['Rinse container', 'Remove labels', 'Flatten'], 'Recycling one plastic bottle saves enough energy to power a lightbulb for 3 hours.', 10, 'collected', now() - interval '2 hours'),
    (demo_citizen_id, demo_ward_id, 'https://placehold.co/400x400?text=Organic', 'wet_organic', true, 'green', ARRAY['Remove packaging', 'Drain liquid'], 'Composting reduces methane emissions by 95%.', 10, 'pending', now() - interval '1 day'),
    (demo_citizen_id, demo_ward_id, 'https://placehold.co/400x400?text=EWaste', 'e_waste', false, 'red', ARRAY['Remove batteries', 'Do not break device'], 'One recycled phone recovers gold equivalent to 3 pieces of jewellery.', 15, 'pending', now() - interval '2 days'),
    (demo_citizen_id, demo_ward_id, 'https://placehold.co/400x400?text=Paper', 'dry_paper', true, 'blue', ARRAY['Keep dry', 'Remove staples', 'Stack neatly'], 'Recycling 1 tonne of paper saves 17 trees.', 10, 'collected', now() - interval '3 days'),
    (demo_citizen_id, demo_ward_id, 'https://placehold.co/400x400?text=Hazardous', 'hazardous', false, 'red', ARRAY['Keep sealed', 'Do not mix with regular waste'], 'Improper hazardous disposal contaminates groundwater for decades.', 15, 'collected', now() - interval '5 days');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ── DEMO ROUTES (for the first authority / collector) ─────────────────────────
DO $$
DECLARE
  auth_id   uuid;
  ward2_id  uuid;
  ward1_id  uuid;
  ward5_id  uuid;
  r1_id     uuid;
  r2_id     uuid;
  r3_id     uuid;
BEGIN
  SELECT id INTO auth_id FROM public.authorities LIMIT 1;
  SELECT id INTO ward2_id FROM public.wards WHERE geojson_id = 'ward_2';
  SELECT id INTO ward1_id FROM public.wards WHERE geojson_id = 'ward_1';
  SELECT id INTO ward5_id FROM public.wards WHERE geojson_id = 'ward_5';

  IF auth_id IS NULL THEN RETURN; END IF;

  -- Route 1: Active
  INSERT INTO public.routes (collector_id, name, ward_id, date, status, distance_km, estimated_minutes)
  VALUES (auth_id, 'Mansarovar Zone A', ward2_id, CURRENT_DATE, 'active', 6.2, 80)
  RETURNING id INTO r1_id;

  INSERT INTO public.route_stops (route_id, address, status, sort_order) VALUES
    (r1_id, '12, Shanti Nagar', 'done', 1),
    (r1_id, '34, Ram Nagar', 'done', 2),
    (r1_id, '56, Patel Marg', 'done', 3),
    (r1_id, '78, Nehru Colony', 'done', 4),
    (r1_id, '90, Vikas Marg', 'done', 5),
    (r1_id, '102, Indira Nagar', 'current', 6),
    (r1_id, '114, Gandhi Path', 'pending', 7),
    (r1_id, '126, Subhash Nagar', 'pending', 8);

  -- Route 2: Pending
  INSERT INTO public.routes (collector_id, name, ward_id, date, status, distance_km, estimated_minutes)
  VALUES (auth_id, 'Vaishali Nagar Zone B', ward1_id, CURRENT_DATE, 'pending', 4.8, 65)
  RETURNING id INTO r2_id;

  INSERT INTO public.route_stops (route_id, address, status, sort_order) VALUES
    (r2_id, '45, Vikas Path', 'pending', 1),
    (r2_id, '67, Shyam Nagar', 'pending', 2),
    (r2_id, '89, Laxmi Colony', 'pending', 3),
    (r2_id, '11, Durga Marg', 'pending', 4),
    (r2_id, '33, Saraswati Nagar', 'pending', 5),
    (r2_id, '55, Hanuman Path', 'pending', 6);

  -- Route 3: Done
  INSERT INTO public.routes (collector_id, name, ward_id, date, status, distance_km, estimated_minutes)
  VALUES (auth_id, 'Sanganer Zone C', ward5_id, CURRENT_DATE, 'done', 3.5, 45)
  RETURNING id INTO r3_id;

  INSERT INTO public.route_stops (route_id, address, status, sort_order) VALUES
    (r3_id, '23, Gandhi Nagar', 'done', 1),
    (r3_id, '56, Pratap Nagar', 'done', 2),
    (r3_id, '78, Nehru Marg', 'done', 3),
    (r3_id, '90, Azad Colony', 'done', 4),
    (r3_id, '12, Bhagat Singh Path', 'done', 5);

EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ── DEMO CITIZEN REQUESTS ─────────────────────────────────────────────────────
DO $$
DECLARE
  ward11_id uuid;
  ward19_id uuid;
  ward17_id uuid;
  ward20_id uuid;
BEGIN
  SELECT id INTO ward11_id FROM public.wards WHERE geojson_id = 'ward_11';
  SELECT id INTO ward19_id FROM public.wards WHERE geojson_id = 'ward_19';
  SELECT id INTO ward17_id FROM public.wards WHERE geojson_id = 'ward_17';
  SELECT id INTO ward20_id FROM public.wards WHERE geojson_id = 'ward_20';

  INSERT INTO public.citizen_requests (address, ward_id, waste_type, urgency, description, status) VALUES
    ('33, Tilak Nagar, Jhotwara',       ward11_id, 'Bulk Waste',          'high',   'Large furniture items blocking pathway. Urgent removal needed.',                 'open'),
    ('78, Shastri Nagar, Murlipura',    ward19_id, 'Construction Debris', 'medium', 'Renovation waste — bricks and cement bags from recent remodelling.',              'open'),
    ('15, Vidhyadhar Nagar',            ward17_id, 'Medical Waste',       'high',   'Used syringes and medical packaging from home-care patient. Needs safe disposal.', 'open'),
    ('62, Bani Park',                   ward20_id, 'Garden Waste',        'low',    'Tree branches and dry leaves from garden pruning.',                               'open');

EXCEPTION WHEN OTHERS THEN NULL;
END $$;
