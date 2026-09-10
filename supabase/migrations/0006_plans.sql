-- Create plans table
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  
  price_paise integer not null,
  duration_days integer not null,
  
  description text,
  is_active boolean default true,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.plans enable row level security;

-- Everyone can read active plans
create policy "Anyone can read active plans" on public.plans
  for select
  using (is_active = true);

-- Admins can read all plans
create policy "Admins can read all plans" on public.plans
  for select
  to authenticated
  using (
    exists (
      select 1 from auth.users
      where auth.uid() = id
      and raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Seed plans
insert into public.plans (code, name, price_paise, duration_days, description)
values
  ('starter', 'Starter', 19900, 30, '15 full-length NSSB mock tests, detailed answers and explanations, 2 attempts per test.'),
  ('pro', 'Pro', 39900, 90, 'Access to all NSSB mock tests, interactive PYQs, sectional tests, unlimited reattempts.'),
  ('complete', 'Complete', 69900, 180, 'Everything included in Pro, plus access to all supported NSSB exam series and advanced analysis.');
