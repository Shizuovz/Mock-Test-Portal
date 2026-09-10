-- Migration 0010: Standardize on ₹499 1-Year All-Access Pass
-- Deactivate legacy plans
UPDATE public.plans
SET is_active = false
WHERE code IN ('starter', 'pro', 'complete');

-- Insert or update the official ₹499 1-Year All-Access Pass
INSERT INTO public.plans (
  code,
  name,
  price_paise,
  duration_days,
  description,
  is_active
) VALUES (
  'all_access_12m',
  'All-Access Unlimited Pass',
  49900,
  365,
  'Unlimited access to all NSSB, SSC & NPSC mock tests, chapter-wise sets, and performance analytics for 12 months.',
  true
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  price_paise = EXCLUDED.price_paise,
  duration_days = EXCLUDED.duration_days,
  description = EXCLUDED.description,
  is_active = true,
  updated_at = NOW();
