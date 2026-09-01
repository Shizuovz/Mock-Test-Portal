# Architecture Essentials
## Online Mock Test and Exam Preparation Platform

**Document Version:** 1.0  
**Status:** Draft  
**Purpose:** Practical architecture guide for building the MVP  
**Primary Stack:** Next.js, React, TypeScript, Tailwind CSS, Supabase  
**Hosting Target:** Vercel  

---

# 1. Executive Summary

This project should be built as a single full-stack Next.js application backed by Supabase. The application will allow students to register, browse exams, take timed MCQ mock tests, autosave answers, submit attempts, receive server-calculated scores, review explanations, and track progress.

The core architectural principle is simple:

> Public catalog content can be cached. Active test state must stay fresh and authoritative.

The platform should not treat the browser as trusted for timing, scoring, answer correctness, permissions, or ownership. The browser provides the experience. Supabase PostgreSQL and server-side application logic protect the integrity of the test.

The areas most likely to break are autosave, timer expiry, duplicate submission, live admin edits, and RLS policy mistakes. These are first-class architecture concerns, not afterthoughts.

---

# 2. Core Technical Decisions

| Area | Decision |
|---|---|
| Frontend | Next.js + React + TypeScript |
| Styling | Tailwind CSS |
| UI components | shadcn/ui and Radix primitives where useful |
| Backend layer | Next.js Server Components, Server Actions, Route Handlers |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Authorization | Supabase Row Level Security plus server-side role checks |
| Storage | Supabase Storage |
| Validation | Zod |
| Forms | React Hook Form |
| Client state | Local React state first; Zustand only for active test UI complexity |
| Caching | Next.js cache, cache tags, Vercel/static asset caching |
| Testing | Vitest, React Testing Library, Playwright |
| Payments later | Stripe |
| Monitoring later | Sentry |

Supabase is preferred over Firebase because the product is relational by nature. Exams, subjects, topics, questions, tests, attempts, answers, and analytics are easier to model, validate, query, and report on in PostgreSQL.

---

# 3. High-Level Architecture

```text
Browser
  |
  | React UI
  | Tailwind CSS
  | Local interaction state
  v
Next.js Application
  |
  | Server Components
  | Server Actions
  | Route Handlers
  | Middleware
  | Cache revalidation
  v
Supabase
  |
  | Auth
  | PostgreSQL
  | Row Level Security
  | Storage
  v
Data and Assets
```

The MVP should not start with a separate backend service. Next.js can handle rendering, secure server-side actions, API endpoints, authentication-aware data access, and cache invalidation. If the platform later needs dedicated workers, queues, analytics services, or separate APIs, those can be extracted when there is a real reason.

---

# 4. Main Application Areas

## 4.1 Public Area

Public routes are available to visitors before login.

Includes:

- Landing page
- Exam directory
- Exam detail pages
- Public test listings
- About/help pages
- Login
- Registration
- Forgot password

Architecture note:

Public exam and test catalog pages are ideal for caching because many users see the same data.

## 4.2 Student Area

Student routes require authentication.

Includes:

- Student dashboard
- Available mock tests
- Test instructions
- Active test attempt
- Result page
- Attempt history
- Answer review
- Bookmarks
- Performance overview
- Profile/settings

Architecture note:

Student-specific pages should not use long-lived shared caching. A student's attempts, answers, results, and dashboard are private and user-specific.

## 4.3 Test Engine

The test engine is the most important part of the platform.

It handles:

- Starting a test attempt
- Loading safe question payloads
- Tracking remaining time
- Saving answers
- Marking questions for review
- Navigating questions
- Submitting an attempt
- Auto-expiring attempts
- Calculating scores
- Showing result/review data

Architecture note:

The test engine must never expose correct answers before submission.

## 4.4 Admin Area

Admin/editor routes require elevated permissions.

Includes:

- Admin dashboard
- Exam management
- Subject management
- Topic management
- Question bank
- Question creation/editing
- Bulk import
- Mock test builder
- Publish/unpublish controls
- Attempt/report views
- User/role management

Architecture note:

Admin security must be enforced in server code and Supabase RLS, not only by hiding links in the UI.

---

# 5. Recommended Project Structure

```text
mock-test-platform/
|
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── exams/
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
│   │       ├── instructions/
│   │       ├── page.tsx
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

Keep business rules in `lib/` where they can be tested. Avoid burying scoring, permissions, or validation logic directly inside UI components.

---

# 6. Domain Model Essentials

The educational hierarchy is:

```text
Exam -> Subject -> Topic -> Question
```

Mock tests are assembled from the question bank:

```text
Test -> Test Questions -> Questions
```

Student activity is recorded as:

```text
Profile/User -> Test Attempt -> User Answers -> Result
```

This separation matters because the same question can appear in more than one test, and the platform can later support topic-wise practice, previous-year papers, daily quizzes, or premium test packages without redesigning the database.

Published tests need stability. Once students have started a test, later admin edits must not change the meaning of their attempt. For the MVP, use a simple locking rule: avoid editing published questions that already have attempts. If changes are needed, archive the old question/test version and publish a corrected copy.

---

# 7. Essential Database Tables

Use UUID primary keys. Add `created_at` and `updated_at` where appropriate. Use foreign keys and unique constraints instead of relying only on application code.

## 7.1 profiles

Supabase Auth stores the authentication user. The application stores profile and role data here.

```text
profiles
---------------------------
id uuid primary key references auth.users(id)
full_name text
avatar_url text
role text not null default 'student'
created_at timestamptz
updated_at timestamptz
```

Allowed roles:

```text
student
editor
admin
```

## 7.2 exams

```text
exams
---------------------------
id uuid primary key
name text not null
slug text unique not null
description text
logo_url text
is_active boolean not null default true
created_at timestamptz
updated_at timestamptz
```

## 7.3 subjects

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

Required constraint:

```text
unique(exam_id, slug)
```

## 7.4 topics

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

Required constraint:

```text
unique(subject_id, slug)
```

## 7.5 questions

```text
questions
---------------------------
id uuid primary key
topic_id uuid references topics(id)
question_text text not null
question_type text not null default 'single_choice'
difficulty text
explanation text
default_marks numeric not null default 1
default_negative_marks numeric not null default 0
status text not null default 'draft'
created_by uuid references profiles(id)
created_at timestamptz
updated_at timestamptz
```

Initial supported question type:

```text
single_choice
```

Future types:

```text
multiple_choice
true_false
integer
```

## 7.6 question_options

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

Important rule:

`is_correct` must never be included in the active test payload sent to students.

## 7.7 tests

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
is_published boolean not null default false
starts_at timestamptz
ends_at timestamptz
created_by uuid references profiles(id)
created_at timestamptz
updated_at timestamptz
```

Required constraint:

```text
unique(exam_id, slug)
```

## 7.8 test_questions

```text
test_questions
---------------------------
id uuid primary key
test_id uuid references tests(id)
question_id uuid references questions(id)
order_index integer not null
marks numeric
negative_marks numeric
created_at timestamptz
```

Required constraints:

```text
unique(test_id, question_id)
unique(test_id, order_index)
```

## 7.9 test_attempts

```text
test_attempts
---------------------------
id uuid primary key
user_id uuid references profiles(id)
test_id uuid references tests(id)
status text not null
started_at timestamptz not null
expires_at timestamptz not null
submitted_at timestamptz
score numeric
max_score numeric
correct_count integer
wrong_count integer
unanswered_count integer
time_taken_seconds integer
created_at timestamptz
updated_at timestamptz
```

Attempt statuses:

```text
in_progress
submitted
expired
cancelled
```

The server owns `started_at`, `expires_at`, `submitted_at`, and score fields.

## 7.10 user_answers

```text
user_answers
---------------------------
id uuid primary key
attempt_id uuid references test_attempts(id)
question_id uuid references questions(id)
selected_option_id uuid references question_options(id)
is_marked_for_review boolean not null default false
answered_at timestamptz
created_at timestamptz
updated_at timestamptz
```

Required constraint:

```text
unique(attempt_id, question_id)
```

## 7.11 bookmarks

```text
bookmarks
---------------------------
id uuid primary key
user_id uuid references profiles(id)
question_id uuid references questions(id)
created_at timestamptz
```

Required constraint:

```text
unique(user_id, question_id)
```

## 7.12 audit_logs

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

Use this for sensitive admin actions such as publishing tests, changing correct answers, editing roles, and importing question batches.

## 7.13 Content Versioning Rule for MVP

Do not build a complex versioning system in the MVP unless required. Instead, enforce this operational rule:

```text
Draft content can be edited freely.
Published content can receive minor typo/explanation edits.
Correct answers, marks, options, and question meaning should not be changed after attempts exist.
If a published question/test needs a meaningful correction, archive it and create a new copy.
```

This prevents old results from becoming inconsistent without adding a heavy versioning model too early.

---

# 8. Authentication and Authorization

## 8.1 Authentication

Use Supabase Auth for:

- Registration
- Login
- Logout
- Forgot password
- Password reset
- Email verification if enabled
- Session refresh

Do not create a custom password table.

## 8.2 Authorization

Authorization must happen in four places:

- Route-level protection in Next.js.
- Server-side checks in actions and route handlers.
- Supabase RLS policies.
- Admin/editor role checks.

Role behavior:

```text
student
- Read published exams/tests.
- Start their own test attempts.
- Save answers for their own active attempts.
- Read their own results.
- Manage their own bookmarks.

editor
- Create and edit educational content.
- Manage draft questions/tests.
- Cannot manage users or roles by default.

admin
- Manage all platform content.
- Publish/unpublish tests.
- Manage users and roles.
- View reports and attempts.
```

Frontend UI should make permissions feel clear, but it must not be the source of truth.

---

# 9. Row Level Security Essentials

Enable RLS on all application tables.

Minimum RLS rules:

- Students can read active/published exams, subjects, topics, and tests.
- Students can read only their own attempts.
- Students can create attempts only for themselves.
- Students can update answers only for their own in-progress attempts.
- Students cannot update submitted or expired attempts.
- Students cannot write scores.
- Students cannot read correct answer flags during active tests.
- Editors can manage content according to role.
- Admins can manage platform data.

For `user_answers`, ownership should be checked through the parent attempt:

```text
user_answers.attempt_id -> test_attempts.id
test_attempts.user_id = auth.uid()
```

For safe question delivery, prefer one of these:

- Server-side query that strips sensitive fields.
- Database view that excludes `is_correct`.
- RPC function that returns a safe payload.

Do not rely on client-side filtering to hide correct answers.

---

# 10. Test Attempt Lifecycle

## 10.1 Start Attempt

When a student starts a test:

1. Confirm the user is authenticated.
2. Confirm the test is published.
3. Confirm the test is available within `starts_at` and `ends_at`, if those fields are used.
4. Check attempt limits if the product enforces them.
5. Create a `test_attempts` row.
6. Set `started_at` on the server.
7. Set `expires_at = started_at + duration_minutes`.
8. Return the attempt ID.
9. Return the safe question payload.

Safe question payload:

```text
question_id
question_text
question_type
options
marks if needed for display
```

Forbidden active-test payload:

```text
is_correct
correct_option_id
explanation
score
server scoring rules
```

## 10.2 Active Attempt

The active attempt UI should support:

- Question display
- Option selection
- Timer
- Question palette
- Previous/next navigation
- Mark for review
- Save status
- Submit confirmation

The UI may maintain temporary state for speed, but the database is the source of truth.

## 10.3 Autosave

Autosave happens whenever the student selects, changes, or clears an answer.

Flow:

```text
Student selects answer
  |
  v
UI updates immediately
  |
  v
Server validates attempt ownership and time
  |
  v
Server upserts user_answers
  |
  v
UI confirms saved status
```

Autosave must validate:

- The authenticated user owns the attempt.
- The attempt is `in_progress`.
- The current time is before `expires_at`.
- The question belongs to the test.
- The option belongs to the question.
- The attempt has not already been submitted.

## 10.4 Timer

Timer enforcement is server-side.

The browser displays:

```text
expires_at - current_time
```

The server decides whether an attempt is still valid. If the browser is closed, refreshed, or manipulated, the server timestamps still determine expiry.

## 10.5 Submit Attempt

Submission flow:

1. Confirm the user owns the attempt.
2. Confirm the attempt is still in progress.
3. Stop accepting answer changes.
4. Fetch test questions and correct answers on the server.
5. Fetch saved user answers.
6. Calculate score on the server.
7. Store result summary on `test_attempts`.
8. Set `submitted_at`.
9. Mark status as `submitted` or `expired`.
10. Return result summary.

Submission should be idempotent. If the same attempt is submitted twice, the second request should return the already stored result instead of recalculating unpredictably.

## 10.6 Same Attempt in Multiple Tabs

Students may open the same attempt in more than one tab. The server must still be authoritative.

Rules:

- Each answer save should upsert by `attempt_id` and `question_id`.
- The latest valid save wins before submission.
- A submitted attempt rejects future answer saves from every tab.
- The UI should refresh attempt state after a submit or save conflict.

## 10.7 Expired Attempt Recovery

If a student closes the browser and returns after expiry:

1. Load the attempt.
2. Compare current server time with `expires_at`.
3. Reject further answer saves.
4. Submit or mark the attempt as expired using saved answers.
5. Show the result if review is allowed.

---

# 11. Scoring Rules

The scoring module should be isolated and unit-tested.

Initial scoring logic for single-choice MCQs:

```text
if unanswered:
  score += 0
  unanswered_count += 1

if selected option is correct:
  score += marks
  correct_count += 1

if selected option is wrong:
  score -= negative_marks
  wrong_count += 1
```

The scoring module should support:

- Per-question marks
- Per-question negative marks
- Test-level totals
- Correct count
- Wrong count
- Unanswered count
- Percentage
- Time taken

Product decision:

Scores may go below zero if negative marking exceeds correct marks. If the target exam floors scores at zero, add a test-level setting later:

```text
allow_negative_total_score boolean
```

For MVP, allow negative totals unless a specific exam rule says otherwise.

Future-friendly design:

- Keep `question_type`.
- Keep scoring logic modular.
- Do not hardcode all behavior directly into the submit route.

---

# 12. Result and Review

After submission, students should see:

- Score
- Maximum score
- Percentage
- Correct count
- Wrong count
- Unanswered count
- Time taken
- Question review
- Selected answer
- Correct answer
- Explanation
- Subject/topic breakdown later

Correct answers and explanations are safe to show after submission, unless a test is configured to hide review details.

Potential review modes:

```text
immediate_review
after_submission
after_test_window_closes
never
```

For MVP, use:

```text
after_submission
```

---

# 13. Caching Essentials

Use caching carefully.

## 13.1 Cache These

```text
Exam list
Subject list
Topic list
Published test catalog
Public test metadata
Help pages
Static images
Logos
Fonts
Public marketing content
```

## 13.2 Do Not Cache These Aggressively

```text
Active test attempts
Current answers
Timer enforcement
Submission status
Student-specific dashboards
Private results
Correct answer payloads
Admin write screens
```

## 13.3 Cache Tags

Suggested tags:

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

Admin edits should trigger revalidation:

```text
Admin updates exam -> revalidateTag("exams") and revalidateTag("exam:{examId}")
Admin publishes test -> revalidateTag("tests") and revalidateTag("exam:{examId}")
Admin updates test -> revalidateTag("test:{testId}")
```

Redis is not needed for MVP. Add Redis later only for clear needs such as high-traffic leaderboards, rate limiting, queues, distributed locks, or real-time competition features.

---

# 14. Validation Essentials

Use Zod for all important input boundaries:

- Register/login profile data.
- Admin exam forms.
- Subject/topic forms.
- Question forms.
- Test builder forms.
- Start attempt requests.
- Save answer requests.
- Submit requests.
- Bulk import rows.

Validate on the client for UX. Validate on the server for security.

Server-side validation is mandatory.

---

# 15. Admin Content Workflow

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
Revalidate cache
```

Question lifecycle:

```text
draft -> published -> archived
```

Test lifecycle:

```text
draft -> published -> unpublished -> archived
```

Publishing should be an explicit action because it changes what students can see. A separate `review` state can be added later if there are multiple content editors.

---

# 16. Bulk Import Essentials

Bulk import should be included soon after the core question-bank workflow because manual question entry will become slow.

Supported import formats later:

- CSV
- XLSX
- JSON

Import flow:

1. Upload file.
2. Parse rows.
3. Validate required fields.
4. Show preview.
5. Highlight invalid rows.
6. Allow cancellation before import.
7. Insert valid records.
8. Report errors and successes.
9. Write audit log.

Initial import columns:

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

# 17. Storage Essentials

Use Supabase Storage for:

- Exam logos
- Question images
- Explanation images
- User avatars
- Import files

Suggested buckets:

```text
public-assets
question-assets
avatars
imports
```

Access rules:

- Public assets can be publicly readable.
- Avatars should be user-owned or publicly readable depending on product choice.
- Import files should be admin/editor-only.
- Question assets should be accessible only when the related question/test is accessible.

---

# 18. Performance Essentials

Important indexes:

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

Performance rules:

- Paginate admin question lists.
- Paginate attempt history.
- Cache public catalogs.
- Store result summaries after scoring.
- Do not run heavy analytics on every dashboard page load.
- Add short-lived cached aggregates for dashboard metrics later.
- Use Supabase connection pooling for serverless deployments when appropriate.

---

# 19. Security Essentials

Non-negotiable rules:

- Never expose Supabase service role key to the browser.
- Never send `is_correct` during active attempts.
- Never calculate final score in the browser.
- Never trust client-submitted score.
- Never trust client timer state.
- Never allow answer changes after submission.
- Never allow answer changes after expiry.
- Validate all write operations server-side.
- Enforce RLS on user-owned tables.
- Audit sensitive admin actions.

Sensitive actions:

- Role changes.
- Correct answer changes.
- Test publication.
- Attempt submission.
- Bulk imports.
- Payment webhooks later.

---

# 20. Error Handling Essentials

Handle these cases explicitly:

- Network failure during autosave.
- Attempt expired during save.
- Duplicate submit request.
- Auto-submit and manual submit happen at nearly the same time.
- Student submits at the exact moment the timer reaches zero.
- Student opens the same attempt in two tabs.
- Student changes answers rapidly before previous saves finish.
- Student closes the browser and returns after expiry.
- User role changes while the user is logged in.
- Invalid question/option pair.
- Question has no correct option.
- Question has multiple correct options while configured as `single_choice`.
- Test has zero questions.
- Test has invalid duration.
- Question image fails to load during a test.
- Admin unpublishes a test while students are taking it.
- Admin edits a question after attempts exist.
- User tries to access another user's attempt.
- Admin submits invalid content.
- Import file has invalid rows.
- Database constraint fails.

Autosave UI should show:

```text
Saving
Saved
Retrying
Failed to save
```

Submission should be idempotent:

```text
First submit -> calculate and store result
Second submit -> return existing stored result
```

---

# 21. MVP Simplification Rules

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

# 22. Testing Essentials

## Unit Tests

Test:

- Scoring logic.
- Negative marking.
- Unanswered questions.
- Timer expiry calculations.
- Expired attempt recovery.
- Permission helpers.
- Validation schemas.

## Component Tests

Test:

- Option selection.
- Question palette.
- Mark for review.
- Timer display.
- Result summary.
- Admin form validation.

## End-to-End Tests

Test:

- Register/login.
- Start test.
- Select answers.
- Autosave answer.
- Navigate questions.
- Mark for review.
- Submit test.
- Submit twice.
- Resume after browser refresh.
- Resume after expiry.
- Try the same attempt in two tabs.
- View result.
- Admin creates and publishes a test.

## Database/RLS Tests

Test:

- Student cannot read another student's attempt.
- Student cannot update another student's answer.
- Student cannot update submitted attempts.
- Student cannot read correct answers during active attempt.
- Editor cannot change roles.
- Admin can manage content.

---

# 23. Deployment Essentials

Deployment model:

```text
GitHub
  |
  v
Vercel
  |
  v
Next.js App
  |
  v
Supabase
  |
  v
PostgreSQL + Auth + Storage
```

Required environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DATABASE_URL
```

Important:

- Public Supabase URL and anon key can be exposed to the browser.
- Service role key must be server-only.
- Use separate Supabase projects or strict environment separation for development, staging, and production.
- Manage schema through migrations.

---

# 24. MVP Build Order

## Phase 1: Foundation

- Create Next.js app.
- Configure TypeScript.
- Configure Tailwind.
- Add Supabase.
- Set up auth.
- Create `profiles`.
- Add roles.
- Add route protection.

## Phase 2: Content Model

- Exams.
- Subjects.
- Topics.
- Questions.
- Question options.
- Admin CRUD screens.

## Phase 3: Test Builder

- Tests.
- Test questions.
- Duration.
- Marks and negative marks.
- Publish/unpublish.
- Cache revalidation.

## Phase 4: Test Taking

- Test catalog.
- Instructions page.
- Start attempt.
- Active test UI.
- Autosave.
- Timer.
- Submit.

## Phase 5: Results

- Server-side scoring.
- Result summary.
- Answer review.
- Explanation display.
- Attempt history.

## Phase 6: Dashboard and Polish

- Student dashboard.
- Basic analytics.
- Bookmarks.
- Weak-topic summary.
- Admin reporting.
- E2E test coverage.

---

# 25. Key Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Correct answers leak before submission | Use safe payloads, RLS, server-side filtering, views/RPCs |
| Timer manipulation | Use server-owned `started_at` and `expires_at` |
| Autosave fails silently | Show save status and retry carefully |
| Duplicate submission | Make submission idempotent |
| Auto-submit conflicts with manual submit | Use one idempotent submit endpoint |
| Same attempt opens in multiple tabs | Upsert answers and reject saves after submission |
| Student changes answers after submit | Lock attempt status and reject writes |
| Published content changes after attempts exist | Archive and copy instead of mutating meaningful content |
| Stale public content | Use cache tags and revalidate on admin changes |
| Large question bank becomes slow | Index, paginate, filter, add search later |
| Admin mistakes affect live tests | Use draft/published/archived lifecycle and focused audit logs |

---

# 26. Architecture Decision Records

## ADR 001: Use Next.js as the full-stack framework

**Decision:** Build the MVP as one Next.js application.

**Reason:** Next.js supports UI, server-rendered pages, secure server actions, route handlers, middleware, and caching in one deployable app.

**Consequence:** The MVP stays simpler. Backend services can be extracted later only if needed.

## ADR 002: Use Supabase PostgreSQL

**Decision:** Use Supabase for database, auth, RLS, and storage.

**Reason:** The domain is relational and benefits from SQL joins, constraints, transactions, and analytics.

**Consequence:** The team must design RLS carefully, but the data model stays clean.

## ADR 003: Score only on the server

**Decision:** Final scoring happens in server-side code.

**Reason:** The browser cannot be trusted with correct answers or scoring logic.

**Consequence:** Submissions require a secure server/database operation.

## ADR 004: Use server timestamps for test timing

**Decision:** Test timing is based on `started_at` and `expires_at`.

**Reason:** Browser timers can be paused, refreshed, modified, or interrupted.

**Consequence:** The UI countdown is only a display, while the server remains authoritative.

## ADR 005: Cache public content, not active attempts

**Decision:** Cache shared public data, but keep live attempt data fresh.

**Reason:** Public catalogs benefit from caching. Active tests require strict correctness.

**Consequence:** Performance improves without risking stale answers, timers, or submissions.

## ADR 006: Do not add Redis for MVP

**Decision:** Start without Redis.

**Reason:** Next.js caching, Vercel CDN, PostgreSQL memory caching, and Supabase pooling are enough for the first version.

**Consequence:** The stack remains simpler. Redis can be added later for proven scale needs.

## ADR 007: Keep MVP content workflow simple

**Decision:** Use `draft`, `published`, and `archived` for MVP content status.

**Reason:** A separate review workflow adds process complexity before the team needs it.

**Consequence:** Content publishing stays simple. A `review` status can be added later when multiple editors are involved.

## ADR 008: Do not deeply version questions in MVP

**Decision:** Avoid a full versioning system initially; archive and copy published content when meaningful changes are needed after attempts exist.

**Reason:** Full versioning is valuable but can slow down the MVP. The archive-and-copy rule protects historical results with less complexity.

**Consequence:** Admins need a clear operating rule. Later, the system can add formal version tables if content changes become frequent.

---

# 27. Final Implementation Principles

- Build the first version as a clean monolith.
- Keep scoring logic isolated and tested.
- Treat Supabase/PostgreSQL as the source of truth.
- Cache only what is safe to cache.
- Use RLS everywhere user data is involved.
- Never trust the browser for security-sensitive logic.
- Prefer simple server actions and route handlers before adding services.
- Add Redis, queues, analytics infrastructure, and advanced monitoring only when the product actually needs them.

This essentials document should be used as the build guide for the MVP. The larger architecture document can remain the deeper reference, while this file captures the decisions and constraints that should shape day-to-day implementation.
