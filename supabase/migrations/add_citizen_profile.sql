-- Non-breaking: both columns are nullable, existing rows unaffected.
-- Run in Supabase SQL Editor before deploying onboarding code.
ALTER TABLE public.citizens
  ADD COLUMN IF NOT EXISTS name  text,
  ADD COLUMN IF NOT EXISTS phone text;
