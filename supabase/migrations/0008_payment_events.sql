-- Create payment events table
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  
  gateway text not null,
  gateway_event_id text unique not null,
  event_type text not null,
  
  payload jsonb,
  
  processed_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.payment_events enable row level security;

-- Admins can read all payment events
create policy "Admins can view all payment events" on public.payment_events
  for select
  to authenticated
  using (
    exists (
      select 1 from auth.users
      where auth.uid() = id
      and raw_user_meta_data->>'role' = 'admin'
    )
  );

-- No public read access. Only server should insert/process these.
