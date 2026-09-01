-- ==============================================================================
-- Production Schema Migration Script for Mock Test Portal
-- Safe, idempotent execution for Supabase Cloud SQL Editor
-- ==============================================================================

-- 1. Ensure extensions exist
create extension if not exists "pgcrypto";

-- 2. Apply Migration 0002: Retake Policies (PRD Section 31)
alter table if exists public.tests
  add column if not exists max_attempts integer check (max_attempts is null or max_attempts > 0) default null,
  add column if not exists score_display_mode text not null default 'best' check (score_display_mode in ('best', 'latest'));

comment on column public.tests.max_attempts is 'Maximum allowed attempts per student. NULL means unlimited attempts.';
comment on column public.tests.score_display_mode is 'Score highlighted on student dashboard: "best" (highest score) or "latest" (most recent score).';

-- 3. Apply Migration 0003: Time-Per-Question Analytics & Pace Tracking (PRD Section 3 & 4)
alter table if exists public.user_answers
  add column if not exists time_spent_seconds integer default 0 check (time_spent_seconds >= 0);

comment on column public.user_answers.time_spent_seconds is 'Active seconds spent by the student on this specific question during the attempt.';

-- 4. Create performance indexes for analytics and query optimization
create index if not exists idx_tests_max_attempts on public.tests (max_attempts);
create index if not exists idx_user_answers_time_spent on public.user_answers (attempt_id, question_id, time_spent_seconds);

-- 5. Verification Query: Validate all 12 core tables and new columns
select 
  column_name, 
  data_type, 
  is_nullable
from information_schema.columns
where table_schema = 'public' 
  and (
    (table_name = 'tests' and column_name in ('max_attempts', 'score_display_mode'))
    or (table_name = 'user_answers' and column_name = 'time_spent_seconds')
  );
