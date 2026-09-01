create extension if not exists "pgcrypto";

create type public.user_role as enum ('student', 'editor', 'admin');
create type public.question_status as enum ('draft', 'published', 'archived');
create type public.question_type as enum ('single_choice');
create type public.attempt_status as enum ('in_progress', 'submitted', 'expired', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete restrict,
  name text not null,
  slug text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_id, slug)
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete restrict,
  name text not null,
  slug text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_id, slug)
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete restrict,
  question_text text not null,
  question_type public.question_type not null default 'single_choice',
  difficulty text,
  explanation text,
  default_marks numeric not null default 1,
  default_negative_marks numeric not null default 0,
  status public.question_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tests (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete restrict,
  name text not null,
  slug text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  total_marks numeric,
  passing_marks numeric,
  is_published boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_id, slug)
);

create table public.test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  order_index integer not null,
  marks numeric,
  negative_marks numeric,
  created_at timestamptz not null default now(),
  unique (test_id, question_id),
  unique (test_id, order_index)
);

create table public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  test_id uuid not null references public.tests(id) on delete restrict,
  status public.attempt_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  score numeric,
  max_score numeric,
  correct_count integer,
  wrong_count integer,
  unanswered_count integer,
  time_taken_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.test_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  selected_option_id uuid references public.question_options(id) on delete restrict,
  is_marked_for_review boolean not null default false,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, question_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index exams_slug_idx on public.exams(slug);
create index subjects_exam_slug_idx on public.subjects(exam_id, slug);
create index topics_subject_slug_idx on public.topics(subject_id, slug);
create index questions_topic_idx on public.questions(topic_id);
create index questions_status_idx on public.questions(status);
create index tests_exam_slug_idx on public.tests(exam_id, slug);
create index tests_published_idx on public.tests(is_published);
create index test_questions_order_idx on public.test_questions(test_id, order_index);
create index test_attempts_user_test_idx on public.test_attempts(user_id, test_id);
create index test_attempts_status_idx on public.test_attempts(status);
create index user_answers_attempt_question_idx on public.user_answers(attempt_id, question_id);
create index bookmarks_user_question_idx on public.bookmarks(user_id, question_id);

alter table public.profiles enable row level security;
alter table public.exams enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.tests enable row level security;
alter table public.test_questions enable row level security;
alter table public.test_attempts enable row level security;
alter table public.user_answers enable row level security;
alter table public.bookmarks enable row level security;
alter table public.audit_logs enable row level security;
