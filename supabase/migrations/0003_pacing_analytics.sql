-- Migration 0003: Time-Per-Question Analytics & Pace Tracking
-- Adds time_spent_seconds to user_answers table to record active pacing.

alter table public.user_answers
  add column if not exists time_spent_seconds integer default 0 check (time_spent_seconds >= 0);
