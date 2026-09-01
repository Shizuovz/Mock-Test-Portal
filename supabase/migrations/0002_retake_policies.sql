-- Migration: 0002_retake_policies.sql
-- Description: Adds configurable attempt limits and score display strategies to tests (PRD Section 31)

alter table public.tests
  add column if not exists max_attempts integer check (max_attempts is null or max_attempts > 0) default null,
  add column if not exists score_display_mode text not null default 'best' check (score_display_mode in ('best', 'latest'));

comment on column public.tests.max_attempts is 'Maximum allowed attempts per student. NULL means unlimited attempts.';
comment on column public.tests.score_display_mode is 'Score highlighted on student dashboard: "best" (highest score) or "latest" (most recent score).';
