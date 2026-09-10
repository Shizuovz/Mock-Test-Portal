-- Create purchases table
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  
  user_id uuid not null references auth.users(id),
  plan_id uuid not null references public.plans(id),
  
  amount_paid_paise integer not null,
  currency text default 'INR',
  
  payment_gateway text,
  gateway_order_id text,
  gateway_payment_id text,
  
  status text not null check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  
  access_starts_at timestamptz,
  access_expires_at timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index purchases_user_id_idx on public.purchases(user_id);
create index purchases_status_idx on public.purchases(status);
create index purchases_gateway_order_id_idx on public.purchases(gateway_order_id);

-- Enable RLS
alter table public.purchases enable row level security;

-- Users can read their own purchases
create policy "Users can view own purchases" on public.purchases
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins can read all purchases
create policy "Admins can view all purchases" on public.purchases
  for select
  to authenticated
  using (
    exists (
      select 1 from auth.users
      where auth.uid() = id
      and raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Note: we do not allow frontend clients to insert/update purchases directly.
-- That will be handled server-side securely.
