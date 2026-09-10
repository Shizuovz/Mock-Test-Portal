-- Migration 0009: Robust Access Entitlements, Guest Sessions & Atomic Attempt RPCs

-- 1. Drop deprecated purchases and payment_events tables
drop table if exists public.payment_events cascade;
drop table if exists public.purchases cascade;

-- 2. Create guest_sessions table
create table public.guest_sessions (
  id uuid primary key default gen_random_uuid(),
  free_attempts_used integer not null default 0 check (free_attempts_used >= 0),
  free_attempt_limit integer not null default 1 check (free_attempt_limit >= 0),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint guest_sessions_attempts_check check (free_attempts_used <= free_attempt_limit)
);

-- 3. Create user_entitlements table
create table public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  free_attempts_used integer not null default 0 check (free_attempts_used >= 0),
  free_attempt_limit integer not null default 3 check (free_attempt_limit >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_entitlements_attempts_check check (free_attempts_used <= free_attempt_limit)
);

-- Backfill entitlements for existing auth users
insert into public.user_entitlements (user_id, free_attempt_limit, free_attempts_used)
select id, 3, 0 from auth.users
on conflict (user_id) do nothing;

-- 4. Create subscriptions table
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  status text not null check (status in ('active', 'expired', 'cancelled')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_duration_check check (expires_at > starts_at)
);

create index subscriptions_user_status_expires_idx 
on public.subscriptions(user_id, status, expires_at);

-- 5. Create payments table
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR',
  provider text not null,
  provider_order_id text,
  provider_payment_id text,
  status text not null check (status in ('pending', 'captured', 'failed', 'refunded')),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_payment_id)
);

create index payments_user_id_idx on public.payments(user_id);
create index payments_provider_order_id_idx on public.payments(provider_order_id);

-- 6. Alter test_attempts for nullable user_id, guest_session_id, and access_type
alter table public.test_attempts alter column user_id drop not null;

alter table public.test_attempts 
  add column if not exists guest_session_id uuid references public.guest_sessions(id) on delete set null,
  add column if not exists access_type text;

-- Update existing attempts to have registered_free access_type
update public.test_attempts 
set access_type = 'registered_free' 
where access_type is null;

alter table public.test_attempts 
  alter column access_type set not null;

-- Strict Check Constraint: enforce relationship between identity and access_type
alter table public.test_attempts 
  drop constraint if exists test_attempts_identity_access_type_check;

alter table public.test_attempts 
  add constraint test_attempts_identity_access_type_check
  check (
    (guest_session_id is not null
      and user_id is null
      and access_type = 'guest_free')
    or
    (user_id is not null
      and guest_session_id is null
      and access_type in (
        'registered_free',
        'subscription',
        'admin_granted'
      ))
  );

-- Unique partial indexes to prevent duplicate active attempts
create unique index if not exists test_attempts_user_test_in_progress_idx
on public.test_attempts (user_id, test_id)
where status = 'in_progress' and user_id is not null;

create unique index if not exists test_attempts_guest_test_in_progress_idx
on public.test_attempts (guest_session_id, test_id)
where status = 'in_progress' and guest_session_id is not null;

create index if not exists test_attempts_guest_session_idx 
on public.test_attempts(guest_session_id);

-- 7. Trigger on auth.users to auto-provision user_entitlements
create or replace function public.handle_new_user_entitlement()
returns trigger as $$
begin
  insert into public.user_entitlements (user_id, free_attempt_limit, free_attempts_used)
  values (new.id, 3, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_entitlements on auth.users;

create trigger on_auth_user_created_entitlements
  after insert on auth.users
  for each row execute function public.handle_new_user_entitlement();

-- 8. Enable Row Level Security on new tables
alter table public.guest_sessions enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

-- Policies
create policy "Users can view own entitlements" on public.user_entitlements
  for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can view own subscriptions" on public.subscriptions
  for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can view own payments" on public.payments
  for select to authenticated
  using (auth.uid() = user_id);

-- 9. Atomic Attempt Start RPC: Guest Free Attempt
create or replace function public.start_guest_free_attempt(
  p_guest_session_id uuid,
  p_test_id uuid
)
returns public.test_attempts as $$
declare
  v_attempt public.test_attempts;
  v_duration_minutes integer;
  v_started_at timestamptz;
  v_expires_at timestamptz;
begin
  -- 1. Check for resumable in-progress attempt
  select * into v_attempt
  from public.test_attempts
  where guest_session_id = p_guest_session_id
    and test_id = p_test_id
    and status = 'in_progress'
    and expires_at > now()
  order by started_at desc
  limit 1;

  if found then
    return v_attempt;
  end if;

  -- 2. Verify test exists and is published
  select duration_minutes into v_duration_minutes
  from public.tests
  where id = p_test_id and is_published = true;

  if not found then
    raise exception 'TEST_NOT_FOUND';
  end if;

  -- 3. Ensure guest session row exists and consume free attempt atomically
  insert into public.guest_sessions (id, free_attempts_used, free_attempt_limit)
  values (p_guest_session_id, 0, 1)
  on conflict (id) do nothing;

  update public.guest_sessions
  set free_attempts_used = free_attempts_used + 1,
      last_seen_at = now()
  where id = p_guest_session_id
    and free_attempts_used < free_attempt_limit;

  if not found then
    raise exception 'GUEST_ATTEMPT_LIMIT_REACHED';
  end if;

  -- 4. Calculate started_at and expires_at server-side
  v_started_at := now();
  v_expires_at := v_started_at + (v_duration_minutes || ' minutes')::interval;

  -- 5. Insert attempt with unique violation rollback for concurrent requests
  begin
    insert into public.test_attempts (
      guest_session_id,
      test_id,
      status,
      access_type,
      started_at,
      expires_at
    ) values (
      p_guest_session_id,
      p_test_id,
      'in_progress',
      'guest_free',
      v_started_at,
      v_expires_at
    )
    returning * into v_attempt;

    return v_attempt;
  exception
    when unique_violation then
      -- Revert consumed credit
      update public.guest_sessions
      set free_attempts_used = free_attempts_used - 1
      where id = p_guest_session_id;

      -- Return the attempt created by the winning concurrent request
      select * into v_attempt
      from public.test_attempts
      where guest_session_id = p_guest_session_id
        and test_id = p_test_id
        and status = 'in_progress'
        and expires_at > now()
      order by started_at desc
      limit 1;

      if found then
        return v_attempt;
      end if;
      raise;
  end;
end;
$$ language plpgsql security definer;

-- 10. Atomic Attempt Start RPC: Registered Free Attempt
create or replace function public.start_registered_free_attempt(
  p_user_id uuid,
  p_test_id uuid
)
returns public.test_attempts as $$
declare
  v_attempt public.test_attempts;
  v_duration_minutes integer;
  v_max_attempts integer;
  v_test_attempt_count integer;
  v_started_at timestamptz;
  v_expires_at timestamptz;
begin
  -- 1. Check for resumable in-progress attempt
  select * into v_attempt
  from public.test_attempts
  where user_id = p_user_id
    and test_id = p_test_id
    and status = 'in_progress'
    and expires_at > now()
  order by started_at desc
  limit 1;

  if found then
    return v_attempt;
  end if;

  -- 2. Verify test exists, is published, and check test-level max_attempts
  select duration_minutes, max_attempts into v_duration_minutes, v_max_attempts
  from public.tests
  where id = p_test_id and is_published = true;

  if not found then
    raise exception 'TEST_NOT_FOUND';
  end if;

  if v_max_attempts is not null and v_max_attempts > 0 then
    select count(*) into v_test_attempt_count
    from public.test_attempts
    where user_id = p_user_id
      and test_id = p_test_id
      and status in ('submitted', 'expired');

    if v_test_attempt_count >= v_max_attempts then
      raise exception 'TEST_MAX_ATTEMPTS_REACHED';
    end if;
  end if;

  -- 3. Ensure user entitlement row exists and consume free attempt atomically
  insert into public.user_entitlements (user_id, free_attempt_limit, free_attempts_used)
  values (p_user_id, 3, 0)
  on conflict (user_id) do nothing;

  update public.user_entitlements
  set free_attempts_used = free_attempts_used + 1,
      updated_at = now()
  where user_id = p_user_id
    and free_attempts_used < free_attempt_limit;

  if not found then
    raise exception 'FREE_ATTEMPT_LIMIT_REACHED';
  end if;

  -- 4. Calculate started_at and expires_at server-side
  v_started_at := now();
  v_expires_at := v_started_at + (v_duration_minutes || ' minutes')::interval;

  -- 5. Insert attempt with unique violation rollback for concurrent requests
  begin
    insert into public.test_attempts (
      user_id,
      test_id,
      status,
      access_type,
      started_at,
      expires_at
    ) values (
      p_user_id,
      p_test_id,
      'in_progress',
      'registered_free',
      v_started_at,
      v_expires_at
    )
    returning * into v_attempt;

    return v_attempt;
  exception
    when unique_violation then
      -- Revert consumed credit
      update public.user_entitlements
      set free_attempts_used = free_attempts_used - 1
      where user_id = p_user_id;

      -- Return the attempt created by the winning concurrent request
      select * into v_attempt
      from public.test_attempts
      where user_id = p_user_id
        and test_id = p_test_id
        and status = 'in_progress'
        and expires_at > now()
      order by started_at desc
      limit 1;

      if found then
        return v_attempt;
      end if;
      raise;
  end;
end;
$$ language plpgsql security definer;

-- 11. Atomic Attempt Start RPC: Subscription Attempt
create or replace function public.start_subscription_attempt(
  p_user_id uuid,
  p_test_id uuid
)
returns public.test_attempts as $$
declare
  v_attempt public.test_attempts;
  v_duration_minutes integer;
  v_max_attempts integer;
  v_test_attempt_count integer;
  v_started_at timestamptz;
  v_expires_at timestamptz;
begin
  -- 1. Check for resumable in-progress attempt
  select * into v_attempt
  from public.test_attempts
  where user_id = p_user_id
    and test_id = p_test_id
    and status = 'in_progress'
    and expires_at > now()
  order by started_at desc
  limit 1;

  if found then
    return v_attempt;
  end if;

  -- 2. Verify active subscription
  perform 1
  from public.subscriptions
  where user_id = p_user_id
    and status = 'active'
    and starts_at <= now()
    and expires_at > now();

  if not found then
    raise exception 'NO_ACTIVE_SUBSCRIPTION';
  end if;

  -- 3. Verify test exists, is published, and check test-level max_attempts
  select duration_minutes, max_attempts into v_duration_minutes, v_max_attempts
  from public.tests
  where id = p_test_id and is_published = true;

  if not found then
    raise exception 'TEST_NOT_FOUND';
  end if;

  if v_max_attempts is not null and v_max_attempts > 0 then
    select count(*) into v_test_attempt_count
    from public.test_attempts
    where user_id = p_user_id
      and test_id = p_test_id
      and status in ('submitted', 'expired');

    if v_test_attempt_count >= v_max_attempts then
      raise exception 'TEST_MAX_ATTEMPTS_REACHED';
    end if;
  end if;

  -- 4. Calculate started_at and expires_at server-side
  v_started_at := now();
  v_expires_at := v_started_at + (v_duration_minutes || ' minutes')::interval;

  -- 5. Insert attempt with unique violation handling for concurrent requests
  begin
    insert into public.test_attempts (
      user_id,
      test_id,
      status,
      access_type,
      started_at,
      expires_at
    ) values (
      p_user_id,
      p_test_id,
      'in_progress',
      'subscription',
      v_started_at,
      v_expires_at
    )
    returning * into v_attempt;

    return v_attempt;
  exception
    when unique_violation then
      select * into v_attempt
      from public.test_attempts
      where user_id = p_user_id
        and test_id = p_test_id
        and status = 'in_progress'
        and expires_at > now()
      order by started_at desc
      limit 1;

      if found then
        return v_attempt;
      end if;
      raise;
  end;
end;
$$ language plpgsql security definer;
