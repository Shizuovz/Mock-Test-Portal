# Agents
## Instructions for AI and Developer Agents

**Project:** Online Mock Test and Exam Preparation Platform  
**Primary Stack:** Next.js, React, TypeScript, Tailwind CSS, Supabase  
**Database/Auth:** Supabase PostgreSQL, Supabase Auth, Row Level Security  
**Primary Goal:** Build a reliable MVP for timed MCQ mock tests with autosave, secure submission, server-side scoring, and result review.

---

# 1. Core Mission

Agents working on this project must prioritize correctness, reliability, and security over feature volume.

The MVP should focus on one strong path:

```text
Student registers
  -> browses exam/test
  -> starts timed MCQ test
  -> answers are autosaved
  -> submits attempt
  -> score is calculated server-side
  -> result and review are shown
```

Do not expand into leaderboards, payments, AI tutoring, advanced analytics, native apps, or multiple question types until the core test engine is stable.

---

# 2. Non-Negotiable Rules

- Never expose correct answers during an active test.
- Never calculate final scores in the browser.
- Never trust client-submitted scores.
- Never trust client timer state.
- Never expose Supabase service role keys to the browser.
- Never rely on frontend visibility as authorization.
- Never allow answer changes after submission.
- Never allow answer changes after expiry.
- Always validate write operations server-side.
- Always respect Row Level Security.
- Always protect user-owned data.

The browser is a user interface. The server and database are the source of truth.

---

# 3. Preferred Architecture

Use a single Next.js application for the MVP.

```text
Browser
  |
  v
Next.js
  |
  | Server Components
  | Server Actions
  | Route Handlers
  | Middleware
  v
Supabase
  |
  | Auth
  | PostgreSQL
  | RLS
  | Storage
```

Do not create a separate backend service unless the project has a concrete need that Next.js cannot reasonably handle.

---

# 4. Recommended Project Structure

```text
app/
  (public)/
  (auth)/
  dashboard/
  test/
  admin/
  api/

components/
  ui/
  layout/
  test/
  dashboard/
  admin/

lib/
  supabase/
  auth/
  validation/
  scoring/
  cache/
  utils/

types/
middleware.ts
supabase/
  migrations/
  seed.sql
```

Keep business rules in `lib/`, not buried inside UI components.

---

# 5. Data Model Priorities

Core hierarchy:

```text
Exam -> Subject -> Topic -> Question
Test -> Test Questions -> Questions
Profile -> Test Attempt -> User Answers -> Result
```

Essential tables:

- `profiles`
- `exams`
- `subjects`
- `topics`
- `questions`
- `question_options`
- `tests`
- `test_questions`
- `test_attempts`
- `user_answers`
- `bookmarks`
- `audit_logs`

Use UUID primary keys, foreign keys, unique constraints, and timestamps.

---

# 6. Test Engine Rules

The test engine is the most fragile and important part of the project.

## Start Attempt

When starting a test:

1. Confirm the user is authenticated.
2. Confirm the test is published.
3. Confirm the test is available.
4. Create a `test_attempts` row.
5. Set `started_at` and `expires_at` on the server.
6. Return only a safe question payload.

Safe payload:

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

## Autosave

Autosave must validate:

- User owns the attempt.
- Attempt is `in_progress`.
- Current server time is before `expires_at`.
- Question belongs to the test.
- Selected option belongs to the question.
- Attempt has not been submitted.

Use upsert behavior for:

```text
unique(attempt_id, question_id)
```

## Timer

Timer is based on:

```text
expires_at - server_time
```

The browser countdown is only display state.

## Submit

Submission must:

- Be server-side.
- Be idempotent.
- Lock the attempt against future answer changes.
- Fetch correct answers only on the server.
- Store final result summary.
- Return the existing result if submitted twice.

---

# 7. Edge Cases Agents Must Handle

Do not ignore these:

- Student loses internet during autosave.
- Student closes browser and returns after expiry.
- Student submits exactly as timer reaches zero.
- Auto-submit and manual submit happen at the same time.
- Same attempt is open in two tabs.
- Student changes answers rapidly before saves finish.
- Admin unpublishes a test while students are taking it.
- Admin edits a question after attempts exist.
- Question has no correct option.
- Single-choice question has multiple correct options.
- Test has zero questions.
- Test has invalid duration.
- Question image fails to load.
- User role changes while user is logged in.
- Student tries to access another user's attempt.

---

# 8. Content Editing and Versioning

Do not build a complex versioning system for MVP unless explicitly requested.

Use this operating rule:

```text
Draft content can be edited freely.
Published content can receive minor typo/explanation edits.
Correct answers, marks, options, and question meaning should not change after attempts exist.
If a meaningful correction is required, archive the old content and create a corrected copy.
```

This keeps historical results consistent without overengineering.

---

# 9. Caching Rules

Cache:

- Exam lists
- Subject lists
- Topic lists
- Published test catalog
- Public test metadata
- Help/static pages
- Images, logos, fonts

Do not aggressively cache:

- Active attempts
- Current answers
- Timer enforcement
- Submission status
- Private results
- Student dashboards
- Correct-answer payloads
- Admin write screens

Use cache tags such as:

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

Invalidate cache after admin publish/update actions.

---

# 10. Security and RLS

Enable RLS on all application tables.

Minimum expectations:

- Students read only their own attempts.
- Students update only their own active answers.
- Students cannot update submitted or expired attempts.
- Students cannot read correct answer flags during active attempts.
- Editors cannot change roles.
- Admins can manage content and users.

For `user_answers`, ownership should be enforced through `test_attempts`.

```text
user_answers.attempt_id -> test_attempts.id
test_attempts.user_id = auth.uid()
```

Prefer server-side safe payloads, database views, or RPC functions for active-test question delivery.

---

# 11. Testing Requirements

Prioritize tests around the dangerous parts.

Unit test:

- Scoring logic
- Negative marking
- Timer expiry calculations
- Expired attempt recovery
- Validation schemas
- Permission helpers

E2E test:

- Register/login
- Start test
- Answer questions
- Autosave
- Navigate questions
- Mark for review
- Submit
- Submit twice
- Refresh during attempt
- Resume after expiry
- Same attempt in two tabs
- View result
- Admin creates and publishes test

Database/RLS test:

- Student cannot read another student's attempt.
- Student cannot update another student's answer.
- Student cannot update submitted attempts.
- Student cannot read correct answers during active attempt.
- Editor cannot change roles.
- Admin can manage content.

---

# 12. What Not to Build Yet

Postpone:

- Redis
- Leaderboards
- Advanced analytics
- Adaptive testing
- Multiple question types
- Complex content review workflow
- Institution/teacher accounts
- Native mobile apps
- Payments/subscriptions
- AI tutoring
- AI-generated questions

Keep future-friendly columns where useful, but do not implement future features before the single-choice timed-test MVP works reliably.

---

# 13. Implementation Style

- Prefer simple, explicit code.
- Keep validation schemas close to the server boundary.
- Keep scoring logic isolated and pure where possible.
- Keep UI components focused on presentation and interaction.
- Keep permission logic centralized.
- Use TypeScript types for database payloads and domain objects.
- Use clear names over clever abstractions.
- Add abstractions only when they remove real duplication or risk.

---

# 14. Definition of Done

A feature is not done until:

- It validates inputs server-side.
- It respects authentication and authorization.
- It handles expected failure states.
- It does not leak correct answers.
- It has relevant tests for risky logic.
- It does not add unnecessary infrastructure.
- It fits the MVP build path.

