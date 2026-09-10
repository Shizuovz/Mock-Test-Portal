-- Add commercial and marketing fields to the profiles table
alter table public.profiles
  add column phone_number text,
  add column phone_verified_at timestamptz,
  add column marketing_consent boolean default false,
  add column marketing_consent_at timestamptz,
  add column signup_source text,
  add column utm_source text,
  add column utm_medium text,
  add column utm_campaign text;

-- Update the handle_new_user function to map new metadata fields
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, 
    full_name, 
    avatar_url, 
    role,
    phone_number,
    marketing_consent,
    marketing_consent_at,
    signup_source
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url',
    'student',
    new.raw_user_meta_data ->> 'phone',
    coalesce((new.raw_user_meta_data ->> 'marketing_consent')::boolean, false),
    case when coalesce((new.raw_user_meta_data ->> 'marketing_consent')::boolean, false) = true then now() else null end,
    new.raw_user_meta_data ->> 'signup_source'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
