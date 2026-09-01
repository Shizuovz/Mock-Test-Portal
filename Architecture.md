# Architecture
## Online Mock Test and Exam Preparation Platform

Document Version: 1.0
Status: Draft
Product Type: Web-based exam preparation and online mock-test platform
Primary Stack: Next.js, React, TypeScript, Tailwind CSS, Supabase
Hosting Target: Vercel

---

# 1. Purpose

This document defines the technical architecture for an online MCQ mock-test platform where students can register, browse examinations, take timed mock tests, submit answers, receive scores, review explanations, and track performance.

The architecture is designed for an MVP that can be built quickly while still supporting future growth into paid tests, analytics, leaderboards, topic-wise practice, bulk imports, subscriptions, and mobile/PWA experiences.

The areas most likely to break are autosave, timer expiry, duplicate submission, live admin edits, and RLS policy mistakes. These are first-class architecture concerns and should be tested directly.

---

# 2. Architectural Goals

The system should provide:

- A fast and reliable test-taking experience.
- Secure authentication and authorization.
- Server-side scoring that does not expose correct answers to the client.
- Autosaving of answers during an active attempt.
- Accurate timer behavior based on server-side timestamps.
- A reusable question bank.
- Admin tools for creating exams, subjects, topics, questions, and mock tests.
- Strong data integrity through PostgreSQL constraints.
- Row Level Security for user-owned data.
- Selective caching for public and mostly static data.
- Clear separation between public content, student workflows, and admin workflows.
- A structure that can scale without prematurely adding unnecessary infrastructure.

---

# 3. Recommended Stack

```text
Frontend / Full-stack Framework
Next.js
React
TypeScript

Styling
Tailwind CSS
shadcn/ui
Radix UI primitives where needed

Backend
Next.js Server Components
Next.js Server Actions
Next.js Route Handlers

Database
Supabase PostgreSQL

Authentication
Supabase Auth

Authorization
Supabase Row Level Security

Storage
Supabase Storage

Validation
Zod

Forms
React Hook Form

Client State
Zustand for active test UI state where useful

Caching
Next.js Data Cache
Next.js Router Cache
Cache tags and path revalidation
Vercel CDN/browser caching for static assets
PostgreSQL memory caching

Testing
Vitest
React Testing Library
Playwright

Monitoring Later
Sentry

Payments Later
Stripe

Hosting
Vercel
```

Supabase is recommended over Firebase because this application is strongly relational. Exams contain subjects, subjects contain topics, tests contain questions, users create attempts, attempts contain answers, and analytics require joins and aggregations. PostgreSQL is a natural fit for this model.

---

# 4. High-Level System Architecture

```text
Browser
  |
  | React UI
  | Tailwind CSS
  | Client-side interaction state
  v
Next.js Application
  |
  | Server Components
  | Server Actions
  | Route Handlers
  | Middleware
  | Cache/revalidation layer
  v
Supabase
  |
  | Auth
  | PostgreSQL
  | Row Level Security
  | Storage
  v
Database and File Storage
```

The application should begin as a single Next.js codebase. A separate backend service is not needed for the MVP. Next.js can handle page rendering, secure server actions, API route handlers, authentication-aware data fetching, and cache revalidation.

---

# 5. Application Areas

The system will have five major application areas.

## 5.1 Public Website

Routes for unauthenticated or partially authenticated visitors:

- Landing page
- Exam directory
- Exam detail pages
- Public test catalog
- Pricing page in future
- About page
- FAQ/help pages
- Login
- Registration
- Forgot password

Public pages can be cached aggressively because they are shared by many users and change mainly when admins publish or update content.

## 5.2 Student Area

Routes for authenticated students:

- Dashboard
- Available tests
- Test instructions
- Active test attempt
- Result page
- Attempt history
- Answer review
- Bookmarks
- Performance analytics
- Profile/settings

Student-specific data should not use long-lived shared caching.

## 5.3 Test Engine

The test engine handles:

- Starting attempts
- Loading question payloads
- Timer calculation
- Answer autosave
- Mark for review
- Question navigation
- Submission
- Auto-submit after expiry
- Scoring
- Result generation
- Review mode

The test engine is the most sensitive part of the system because it must preserve integrity and avoid leaking correct answers.

## 5.4 Admin Area

Routes for admins and editors:

- Admin dashboard
- Exams management
- Subjects management
- Topics management
- Question bank
- Question creation/editing
- Bulk question import
- Mock test builder
- Test publish/unpublish controls
- Attempt review
- User management
- Reporting

Admin routes must be protected both in application code and database access rules.

## 5.5 Shared Platform Services

Shared concerns:

- Authentication
- Authorization
- Validation
- Scoring utilities
- Cache invalidation
- Error handling
- Audit logging
- File upload/storage
- Rate limiting later
- Monitoring later

---

# 6. Suggested Project Structure

```text
mock-test-platform/
|
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── exams/
│   │   ├── pricing/
│   │   └── about/
│   |
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   |
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── tests/
│   │   ├── results/
│   │   ├── bookmarks/
│   │   └── performance/
│   |
│   ├── test/
│   │   └── [testId]/
│   │       ├── page.tsx
│   │       ├── instructions/
│   │       └── result/
│   |
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── exams/
│   │   ├── subjects/
│   │   ├── topics/
│   │   ├── questions/
│   │   ├── tests/
│   │   └── users/
│   |
│   └── api/
│       ├── attempts/
│       ├── submit/
│       └── webhooks/
|
├── components/
│   ├── ui/
│   ├── layout/
│   ├── test/
│   ├── dashboard/
│   └── admin/
|
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── validation/
│   ├── scoring/
│   ├── cache/
│   └── utils/
|
├── types/
├── middleware.ts
└── supabase/
    ├── migrations/
    └── seed.sql
```

---

# 7. Domain Model

The core educational hierarchy is:

```text
Exam -> Subject -> Topic -> Question
```

Mock tests are assembled from questions:

```text
Test -> Test Questions -> Questions
```

Student activity is recorded as:

```text
User -> Test Attempt -> User Answers -> Result
```

Published tests need stability. Once students have started a test, later admin edits must not change the meaning of their attempt. For the MVP, use a simple locking rule: avoid editing published questions that already have attempts. If changes are needed, archive the old question/test version and publish a corrected copy.

---

# 8. Database Design

Use UUID primary keys unless there is a strong reason not to. Use `created_at` and `updated_at` timestamps on most tables. Use foreign keys to preserve relational integrity.

## 8.1 profiles

Supabase Auth owns the real authentication user record. The application should create a `profiles` row linked to the auth user.

```text
profiles
---------------------------
id uuid primary key references auth.users(id)
full_name text
avatar_url text
role text
created_at timestamptz
updated_at timestamptz
```

Allowed roles:

```text
student
editor
admin
```

## 8.2 exams

```text
exams
---------------------------
id uuid primary key
name text not null
slug text unique not null
description text
logo_url text
is_active boolean
created_at timestamptz
updated_at timestamptz
```

## 8.3 subjects

```text
subjects
---------------------------
id uuid primary key
exam_id uuid references exams(id)
name text not null
slug text not null
description text
order_index integer
created_at timestamptz
updated_at timestamptz
```

Suggested uniqueness:

```text
unique(exam_id, slug)
```

## 8.4 topics

```text
topics
---------------------------
id uuid primary key
subject_id uuid references subjects(id)
name text not null
slug text not null
description text
order_index integer
created_at timestamptz
updated_at timestamptz
```

Suggested uniqueness:

```text
unique(subject_id, slug)
```

## 8.5 questions

```text
questions
---------------------------
id uuid primary key
topic_id uuid references topics(id)
question_text text not null
question_type text not null
difficulty text
explanation text
default_marks numeric
default_negative_marks numeric
status text
created_by uuid references profiles(id)
created_at timestamptz
updated_at timestamptz
```

Initial question type:

```text
single_choice
```

Future question types:

```text
multiple_choice
true_false
integer
```

Difficulty values:

```text
easy
medium
hard
```

Status values:

```text
draft
review
published
archived
```

## 8.6 question_options

```text
question_options
---------------------------
id uuid primary key
question_id uuid references questions(id)
option_text text not null
is_correct boolean not null default false
order_index integer
created_at timestamptz
updated_at timestamptz
```

Correct answer fields must never be sent to the student test-taking client.

## 8.7 tests

```text
tests
---------------------------
id uuid primary key
exam_id uuid references exams(id)
name text not null
slug text not null
description text
duration_minutes integer not null
total_marks numeric
passing_marks numeric
is_published boolean
starts_at timestamptz
ends_at timestamptz
created_by uuid references profiles(id)
created_at timestamptz
updated_at timestamptz
```

## 8.8 test_questions

```text
test_questions
---------------------------
id uuid primary key
test_id uuid references tests(id)
question_id uuid references questions(id)
order_index integer
marks numeric
negative_marks numeric
created_at timestamptz
```

Suggested uniqueness:

```text
unique(test_id, question_id)
unique(test_id, order_index)
```

## 8.9 test_attempts

```text
test_attempts
---------------------------
id uuid primary key
user_id uuid references profiles(id)
test_id uuid references tests(id)
status text not null
started_at timestamptz not null
submitted_at timestamptz
expires_at timestamptz not null
score numeric
max_score numeric
correct_count integer
wrong_count integer
unanswered_count integer
time_taken_seconds integer
created_at timestamptz
updated_at timestamptz
```

Attempt status values:

```text
in_progress
submitted
expired
cancelled
```

The timer should be calculated from `started_at` and `expires_at`, not from a client-side countdown alone.

## 8.10 user_answers

```text
user_answers
---------------------------
id uuid primary key
attempt_id uuid references test_attempts(id)
question_id uuid references questions(id)
selected_option_id uuid references question_options(id)
is_marked_for_review boolean
answered_at timestamptz
created_at timestamptz
updated_at timestamptz
```

Suggested uniqueness:

```text
unique(attempt_id, question_id)
```

Scoring fields such as `is_correct` may be stored after submission, but they should be generated server-side.

## 8.11 bookmarks

```text
bookmarks
---------------------------
id uuid primary key
user_id uuid references profiles(id)
question_id uuid references questions(id)
created_at timestamptz
```

Suggested uniqueness:

```text
unique(user_id, question_id)
```

## 8.12 audit_logs

```text
audit_logs
---------------------------
id uuid primary key
actor_id uuid references profiles(id)
action text not null
entity_type text not null
entity_id uuid
metadata jsonb
created_at timestamptz
```

Use audit logs for important admin actions such as publishing tests, editing questions, changing correct answers, and changing user roles.

## 8.13 Content Versioning Rule for MVP

Do not build a complex versioning system in the MVP unless required. Instead, enforce this operational rule:

```text
Draft content can be edited freely.
Published content can receive minor typo/explanation edits.
Correct answers, marks, options, and question meaning should not be changed after attempts exist.
If a published question/test needs a meaningful correction, archive it and create a new copy.
```

This prevents old results from becoming inconsistent without adding a heavy versioning model too early.

---

# 9. Authentication

Authentication should use Supabase Auth.

Required flows:

- Register
- Login
- Logout
- Forgot password
- Password reset
- Email verification if enabled
- Session refresh

Future login options:

- Google
- Apple
- Microsoft

The app should use Supabase middleware or server-side session helpers so protected routes can reliably determine the authenticated user.

---

# 10. Authorization

Authorization must happen in multiple layers:

- Route protection in Next.js middleware/layouts.
- Server-side checks in Server Actions and Route Handlers.
- Supabase Row Level Security at the database level.
- Admin/editor role checks for content management.

Frontend visibility is only a convenience. It is not security.

Role summary:

```text
student
- Read published exams/tests.
- Start their own attempts.
- Read and update their own in-progress answers.
- Read their own results.
- Bookmark questions.

editor
- Manage questions and draft tests.
- View content management screens.
- No full user administration unless explicitly granted.

admin
- Manage all exams, subjects, topics, questions, tests, users, roles, attempts, and reports.
```

---

# 11. Row Level Security Strategy

Enable Row Level Security on all application tables.

Public catalog tables can allow read access only to published/active content:

```text
exams
subjects
topics
tests
```

Student-owned tables should be restricted by `auth.uid()`:

```text
test_attempts.user_id = auth.uid()
bookmarks.user_id = auth.uid()
```

For `user_answers`, access should be allowed only if the answer belongs to an attempt owned by the current user.

Admin/editor write policies should check the current user's role from `profiles`.

Sensitive tables and fields need special care:

- Students must not read `question_options.is_correct` before or during a test.
- Students must not update scores.
- Students must not alter attempt ownership.
- Students must not change submitted attempts.
- Editors should not be able to grant themselves admin access.

Because column-level restrictions can be awkward, use server-side queries or database views/RPC functions to expose safe question payloads to students.

---

# 12. Test-Taking Flow

## 12.1 Start Attempt

When a student starts a test:

1. Verify the user is authenticated.
2. Verify the test is published and currently available.
3. Check whether the user can start a new attempt.
4. Create a `test_attempts` row.
5. Set `started_at` on the server.
6. Set `expires_at` using test duration.
7. Return the attempt ID and safe question payload.

The safe question payload should include:

```text
question_id
question_text
question_type
options
marks if needed for UI
```

It should not include:

```text
correct_option_id
is_correct
explanation before submission
server scoring logic
```

## 12.2 Active Attempt

The active attempt screen should include:

- Test title
- Question text
- Options
- Timer
- Next/previous navigation
- Question palette
- Answered/unanswered state
- Mark for review
- Submit button

The client may keep temporary UI state for responsiveness, but the server/database remains the source of truth.

## 12.3 Autosave

Autosave should happen whenever the user selects or changes an answer.

Flow:

```text
Student selects option
  |
  v
Client updates local UI immediately
  |
  v
Server Action or Route Handler validates attempt
  |
  v
Upsert user_answers row
  |
  v
Return saved state
```

Autosave rules:

- Only the attempt owner can save answers.
- Answers can only be saved while the attempt is in progress.
- Answers cannot be saved after `expires_at`.
- Answers cannot be saved after submission.
- The selected option must belong to the selected question.
- The question must belong to the test being attempted.

## 12.4 Timer

The timer displayed in the browser should be derived from server timestamps.

Use:

```text
expires_at - current_time
```

The browser countdown is only a display. The server decides whether the attempt is still valid.

If the timer reaches zero:

- The UI should trigger submission.
- If the UI does not submit, the server should still reject further saves and mark the attempt expired/submitted when the student returns.

## 12.5 Submit Attempt

On submission:

1. Verify the user owns the attempt.
2. Verify the attempt is still in progress.
3. Lock the attempt against further answer changes.
4. Fetch all test questions and correct answers on the server.
5. Fetch user answers.
6. Calculate score.
7. Store result summary on `test_attempts`.
8. Mark attempt as submitted or expired.
9. Return result summary.

Scoring must always happen server-side.

## 12.6 Same Attempt in Multiple Tabs

Students may open the same attempt in more than one tab. The server must still be authoritative.

Rules:

- Each answer save should upsert by `attempt_id` and `question_id`.
- The latest valid save wins before submission.
- A submitted attempt rejects future answer saves from every tab.
- The UI should refresh attempt state after a submit or save conflict.

## 12.7 Expired Attempt Recovery

If a student closes the browser and returns after expiry:

1. Load the attempt.
2. Compare current server time with `expires_at`.
3. Reject further answer saves.
4. Submit or mark the attempt as expired using saved answers.
5. Show the result if review is allowed.

---

# 13. Scoring

The scoring engine should support:

- Correct answers
- Wrong answers
- Unanswered questions
- Positive marks
- Negative marks
- Per-question marks
- Per-test marks
- Future question types

Initial scoring for single-choice MCQs:

```text
if unanswered:
  score += 0
  unanswered_count += 1

if selected_option is correct:
  score += marks
  correct_count += 1

if selected_option is incorrect:
  score -= negative_marks
  wrong_count += 1
```

Store a result summary for fast result pages:

```text
score
max_score
correct_count
wrong_count
unanswered_count
time_taken_seconds
submitted_at
```

Optionally store per-answer scoring results after submission for review pages.

Product decision:

Scores may go below zero if negative marking exceeds correct marks. If the target exam floors scores at zero, add a test-level setting later:

```text
allow_negative_total_score boolean
```

For MVP, allow negative totals unless a specific exam rule says otherwise.

---

# 14. Result and Review Flow

After submission, the student should see:

- Score
- Maximum score
- Percentage
- Correct count
- Wrong count
- Unanswered count
- Time taken
- Subject/topic breakdown
- Question-by-question review
- Correct answer
- Student answer
- Explanation

Explanations and correct answers should only be visible after submission, unless the product later supports practice mode where answers are revealed immediately.

---

# 15. Caching Architecture

Caching should be selective. Shared content can be cached. Student-specific and live attempt state should not be cached aggressively.

## 15.1 What to Cache

```text
Exam list
Subject list
Topic list
Published test metadata
Public test catalog
Public content pages
Help/FAQ pages
Images
Logos
Fonts
Analytics summaries with short TTL
Leaderboards with short TTL later
```

## 15.2 What Not to Cache Aggressively

```text
Active test attempts
Current answers
Timer enforcement
Submission status
Student dashboard data
Private results
Admin write screens
Correct answer payloads exposed to students
```

## 15.3 Cache Tags

Suggested cache tags:

```text
exams
exam:{examId}
subjects
subject:{subjectId}
topics
topic:{topicId}
tests
test:{testId}
questions:{testId}
```

When an admin edits a test:

```text
revalidateTag("test:{testId}")
```

When an admin publishes a new test:

```text
revalidateTag("tests")
revalidateTag("exam:{examId}")
```

When an admin changes an exam:

```text
revalidateTag("exams")
revalidateTag("exam:{examId}")
```

## 15.4 Static Asset Caching

Static assets should use CDN/browser caching:

```text
exam logos
icons
fonts
question images
public images
```

## 15.5 Redis

Redis is not required for the MVP.

The initial architecture already has:

```text
Next.js caching
Vercel CDN
PostgreSQL memory caching
Supabase connection pooling
```

Redis can be added later for:

- High-traffic leaderboards.
- Rate limiting.
- Distributed locks.
- Very frequently updated aggregate counters.
- Queue coordination.
- Real-time competition features.

---

# 16. Supabase Connection Strategy

Use Supabase client utilities appropriate to the environment:

- Browser client for safe, user-scoped reads and actions.
- Server client for authenticated server-side operations.
- Service role key only in secure server-only contexts.

Never expose the service role key to the browser.

Use Supabase connection pooling/Supavisor for serverless deployments where appropriate. This helps avoid excessive database connections from Vercel serverless functions.

---

# 17. Validation

Use Zod schemas for inputs:

- Registration/profile forms.
- Admin exam forms.
- Subject/topic forms.
- Question forms.
- Test creation forms.
- Attempt start requests.
- Answer save requests.
- Submit requests.

Validation should happen on both:

- Client side for fast feedback.
- Server side for trust and security.

Server-side validation is mandatory.

---

# 18. Admin Content Workflow

Recommended workflow:

```text
Create exam
  |
  v
Create subjects
  |
  v
Create topics
  |
  v
Create/import questions
  |
  v
Review questions
  |
  v
Build mock test
  |
  v
Preview test
  |
  v
Publish test
  |
  v
Invalidate cache
```

Question lifecycle:

```text
draft -> published -> archived
```

Test lifecycle:

```text
draft -> published -> unpublished/archived
```

A separate `review` state can be added later if multiple content editors are involved. For the MVP, `draft`, `published`, and `archived` are enough.

---

# 19. Bulk Import

Bulk question import should be prioritized after the core MVP because manual question entry becomes slow at scale.

Potential import formats:

- CSV
- XLSX
- JSON

The import workflow should:

1. Upload file.
2. Parse rows.
3. Validate required fields.
4. Show preview.
5. Highlight errors.
6. Allow correction or cancellation.
7. Import valid records.
8. Report successes and failures.

Initial fields:

```text
exam
subject
topic
question_text
option_a
option_b
option_c
option_d
correct_option
explanation
difficulty
marks
negative_marks
```

---

# 20. File Storage

Use Supabase Storage for:

- Exam logos
- Question images
- Explanation images
- Imported files
- User avatars

Storage buckets:

```text
public-assets
question-assets
imports
avatars
```

Security:

- Public assets may be publicly readable.
- Question assets should be readable only when the question/test is accessible.
- Import files should be admin/editor-only.
- Avatars can be user-owned.

---

# 21. Performance Strategy

Performance priorities:

- Cache public catalog pages.
- Use indexes on all foreign keys.
- Use indexes on slugs.
- Avoid fetching correct answers into the browser.
- Paginate question bank/admin lists.
- Use search/filter indexes where needed.
- Precompute or store result summaries.
- Avoid expensive analytics queries on every dashboard load.
- Use short-lived cached aggregates for reporting later.

Suggested indexes:

```text
exams(slug)
subjects(exam_id, slug)
topics(subject_id, slug)
questions(topic_id)
questions(status)
tests(exam_id, slug)
tests(is_published)
test_questions(test_id, order_index)
test_attempts(user_id, test_id)
test_attempts(status)
user_answers(attempt_id, question_id)
bookmarks(user_id, question_id)
```

---

# 22. Security Strategy

Core security rules:

- Use Supabase Auth for identity.
- Enforce RLS on application tables.
- Keep service role credentials server-only.
- Score tests on the server.
- Never send correct answers during active attempts.
- Never trust client timer state.
- Never trust client-submitted score.
- Validate all inputs server-side.
- Protect admin routes and actions.
- Audit important admin changes.
- Use HTTPS in production.
- Add rate limiting later for sensitive endpoints.

Sensitive actions:

- Role changes.
- Question answer changes.
- Test publication.
- Attempt submission.
- Bulk imports.
- Payment webhooks later.

---

# 23. Error Handling

The platform should handle:

- Network failure during autosave.
- Duplicate submit attempts.
- Auto-submit and manual submit firing at nearly the same time.
- Student submitting exactly as the timer reaches zero.
- Same attempt opened in multiple tabs.
- Rapid answer changes before previous saves finish.
- Browser closed and reopened after expiry.
- Expired attempts.
- Invalid option/question combinations.
- Question with no correct option.
- Question with multiple correct options while configured as `single_choice`.
- Test with zero questions.
- Test with invalid duration.
- Question image failing to load during a test.
- Admin unpublishing a test while students are taking it.
- Admin editing a question after attempts exist.
- User role changing while the user is logged in.
- Unauthorized access.
- Admin validation errors.
- Import failures.
- Database constraint errors.

For autosave:

- Show a subtle saving/saved/error state.
- Retry when appropriate.
- Preserve local UI state while the server confirms.
- Warn the student if answers cannot be saved.

For submission:

- Submission should be idempotent.
- Repeated submission requests should return the existing result if already submitted.

---

# 24. MVP Simplification Rules

The MVP should focus on one reliable path:

```text
One exam
  |
  v
Subjects and topics
  |
  v
Single-choice MCQ question bank
  |
  v
Published timed test
  |
  v
Autosaved attempt
  |
  v
Server-side submission and scoring
  |
  v
Result and answer review
```

Postpone these until the core test engine is stable:

- Redis.
- Leaderboards.
- Advanced analytics.
- Adaptive testing.
- Multiple question types.
- Complex content review workflows.
- Institution/teacher accounts.
- Native mobile apps.
- Payments and subscriptions.
- AI tutoring or AI-generated questions.

Keep the `question_type` column for future flexibility, but implement only `single_choice` in the MVP.

Audit logs should start narrow:

- Test published/unpublished.
- Correct answer changed.
- User role changed.
- Bulk import completed.

---

# 25. Observability

MVP logging:

- Server-side errors.
- Attempt start.
- Attempt submit.
- Admin publish/unpublish actions.
- Import success/failure.

Later monitoring:

- Sentry for frontend/backend errors.
- Vercel logs and analytics.
- Supabase logs.
- Uptime monitoring.

Important metrics:

- Test starts.
- Test completions.
- Autosave failures.
- Submission failures.
- Average test duration.
- Slow queries.
- Admin import failures.

---

# 26. Testing Strategy

## 25.1 Unit Tests

Use Vitest for:

- Scoring logic.
- Timer calculations.
- Expired attempt recovery.
- Validation helpers.
- Permission helpers.
- Cache tag helpers.

## 25.2 Component Tests

Use React Testing Library for:

- Question option selection.
- Question palette state.
- Timer display.
- Result summary.
- Admin form validation.

## 25.3 End-to-End Tests

Use Playwright for:

- Registration/login.
- Starting a test.
- Selecting answers.
- Navigating questions.
- Marking for review.
- Autosaving.
- Submitting.
- Submitting twice.
- Resuming after browser refresh.
- Resuming after expiry.
- Opening the same attempt in two tabs.
- Viewing results.
- Admin creates and publishes a test.

## 25.4 Database Tests

Test:

- RLS policies.
- Foreign key constraints.
- Attempt ownership.
- Answer ownership.
- Students cannot read another student's attempt.
- Students cannot update another student's answer.
- Students cannot update submitted attempts.
- Students cannot read correct answers during active attempts.
- Admin/editor permissions.

---

# 27. Deployment Architecture

Recommended deployment:

```text
GitHub Repository
  |
  v
Vercel
  |
  v
Next.js Application
  |
  v
Supabase Project
  |
  v
PostgreSQL/Auth/Storage
```

Environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_URL
```

The service role key must only be available to server-side code.

Use separate environments:

```text
development
staging
production
```

Use Supabase migrations for schema changes.

---

# 28. Scaling Plan

## MVP Scale

The MVP should comfortably support:

- Public content browsing.
- Authenticated student dashboards.
- Timed tests.
- Autosaved answers.
- Admin content management.

Use the database as the source of truth and rely on Next.js/Vercel/Supabase capabilities before adding extra services.

## Growth Stage

Add:

- Better analytics aggregation.
- More aggressive cache tagging.
- Background jobs for reports.
- Queues for imports.
- Sentry monitoring.
- Rate limiting.

## High Scale Stage

Consider:

- Redis.
- Dedicated background workers.
- Read replicas.
- Search service for large question banks.
- Dedicated analytics warehouse.
- Real-time leaderboard architecture.

---

# 29. Future Extensions

The architecture should allow:

- Paid test packages.
- Stripe subscriptions.
- Topic-wise practice.
- Previous-year papers.
- Daily quizzes.
- Leaderboards.
- Institution/teacher accounts.
- Mobile app or PWA.
- AI explanations or tutoring.
- Discussion comments.
- Certificates.
- Referral system.
- Advanced adaptive testing.

These are intentionally not required for the first release.

---

# 30. Architecture Decision Records

## ADR 001: Use Next.js as the full-stack application framework

Decision:
Use Next.js for the frontend and backend application layer.

Reason:
The MVP does not need a separate backend service. Next.js supports pages, server components, server actions, route handlers, middleware, caching, and deployment on Vercel.

Consequence:
The application remains simpler to build and deploy. If backend needs grow later, specific services can be extracted.

## ADR 002: Use Supabase instead of Firebase

Decision:
Use Supabase PostgreSQL as the primary database and authentication provider.

Reason:
The mock-test domain is relational and benefits from SQL joins, constraints, transactions, and analytics.

Consequence:
The data model remains natural and queryable. The team must understand PostgreSQL and RLS policies.

## ADR 003: Score attempts on the server

Decision:
All scoring must happen server-side.

Reason:
The client cannot be trusted with correct answers or scoring rules.

Consequence:
The result is secure and consistent. Submission requires a server/database round trip.

## ADR 004: Use server timestamps for timers

Decision:
Attempt timing is based on `started_at` and `expires_at` stored by the server.

Reason:
Client-side timers can be manipulated or interrupted.

Consequence:
The browser timer is only a display. The server remains authoritative.

## ADR 005: Cache public content but not active attempts

Decision:
Use Next.js caching for public/shared content and avoid long-lived caching for active attempts and answers.

Reason:
Catalog pages benefit from caching, but active tests require fresh state and strict integrity.

Consequence:
Performance improves without risking stale answer or timer state.

## ADR 006: Delay Redis until there is a concrete need

Decision:
Do not add Redis in the MVP.

Reason:
Next.js caching, Vercel CDN, PostgreSQL memory caching, and Supabase pooling are enough for the initial product.

Consequence:
The architecture stays simpler. Redis can be added later for leaderboards, rate limiting, queues, or high-frequency counters.

## ADR 007: Keep MVP content workflow simple

Decision:
Use `draft`, `published`, and `archived` for MVP content status.

Reason:
A separate review workflow adds process complexity before the team needs it.

Consequence:
Content publishing stays simple. A `review` status can be added later when multiple editors are involved.

## ADR 008: Do not deeply version questions in MVP

Decision:
Avoid a full versioning system initially; archive and copy published content when meaningful changes are needed after attempts exist.

Reason:
Full versioning is valuable but can slow down the MVP. The archive-and-copy rule protects historical results with less complexity.

Consequence:
Admins need a clear operating rule. Later, the system can add formal version tables if content changes become frequent.

---

# 31. MVP Build Order

Recommended implementation phases:

## Phase 1: Foundation

- Create Next.js app.
- Configure TypeScript and Tailwind.
- Add Supabase.
- Create database schema.
- Configure authentication.
- Create profiles and roles.
- Add protected routes.

## Phase 2: Content Model

- Exams.
- Subjects.
- Topics.
- Questions.
- Question options.
- Admin CRUD screens.

## Phase 3: Mock Test Builder

- Tests.
- Test questions.
- Duration and marks.
- Publish/unpublish.
- Cache revalidation.

## Phase 4: Student Test Flow

- Test catalog.
- Test instructions.
- Start attempt.
- Active test screen.
- Autosave.
- Timer.
- Submit.

## Phase 5: Results and Review

- Scoring.
- Result summary.
- Answer review.
- Explanations after submission.
- Attempt history.

## Phase 6: Dashboard and Polish

- Student dashboard.
- Basic analytics.
- Weak topics.
- Bookmarks.
- Admin reporting.
- Playwright coverage.

---

# 32. Key Risks

## Risk: Correct answers leak to students

Mitigation:
Use safe server-side payloads, RLS, database views/RPCs, and never send `is_correct` during active attempts.

## Risk: Timer manipulation

Mitigation:
Use server timestamps and reject writes/submissions after expiry.

## Risk: Autosave failure

Mitigation:
Use immediate local UI feedback, retries, visible save status, and server-side upsert.

## Risk: Duplicate submissions

Mitigation:
Make submission idempotent and lock attempts once submitted.

## Risk: Auto-submit conflicts with manual submit

Mitigation:
Use one idempotent submit endpoint for both manual submission and timer-triggered submission.

## Risk: Same attempt is open in multiple tabs

Mitigation:
Upsert answers by attempt/question, use latest valid save before submission, and reject all saves after submission or expiry.

## Risk: Published content changes after attempts exist

Mitigation:
Archive and copy published content instead of mutating correct answers, options, marks, or question meaning after attempts exist.

## Risk: Admin changes stale cached content

Mitigation:
Use cache tags and revalidate on publish/update actions.

## Risk: Large question bank becomes slow

Mitigation:
Use indexes, pagination, filters, bulk import validation, and later search infrastructure if needed.

---

# 33. Summary

The recommended architecture is a single Next.js application using React, TypeScript, Tailwind CSS, and Supabase. Supabase provides PostgreSQL, Auth, Row Level Security, and Storage, making it well suited for the relational structure of an exam-preparation platform.

The test engine should treat the database as the source of truth, save answers frequently, calculate timers from server timestamps, and score attempts only on the server. Public content should be cached with Next.js and invalidated when admins update content. Active attempts, answers, timers, and submissions should remain fresh and authoritative.

This architecture is intentionally practical for an MVP while preserving a clean path toward subscriptions, analytics, bulk imports, leaderboards, mobile support, and larger-scale infrastructure later.
