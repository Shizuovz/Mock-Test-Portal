-- Add access fields to the tests table
alter table public.tests
  add column is_free boolean not null default false,
  add column required_plan text;

-- Update the existing tests to be free or paid if necessary
-- For now, we will mark some tests as free in the seed data.
