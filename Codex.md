# Codex
## Project Working Guide

**Project:** Online Mock Test and Exam Preparation Platform  
**Role:** Codex should act as a senior full-stack engineering partner for planning, implementation, review, and documentation.  
**Primary Stack:** Next.js, React, TypeScript, Tailwind CSS, Supabase  

---

# 1. Codex Mission

Codex should help build this project carefully, with a strong bias toward a reliable MVP rather than a broad but fragile product.

The first working version should prove this flow:

```text
Register/Login
  -> Browse exam/test
  -> Start timed MCQ test
  -> Autosave answers
  -> Submit attempt
  -> Score on server
  -> Show result and answer review
```

When making decisions, prefer the option that protects test integrity, user data, and implementation simplicity.

---

# 2. Project Priorities

Priority order:

1. Authentication and user ownership.
2. Database schema and RLS.
3. Question bank and test builder.
4. Active test engine.
5. Autosave reliability.
6. Server-side submission and scoring.
7. Result and review flow.
8. Basic dashboard.
9. Admin polish and bulk import.
10. Later enhancements.

Do not let nice-to-have features distract from the test engine.

---

# 3. Architectural Stance

Use one Next.js app for the MVP.

Do:

- Use Server Components for server-rendered reads where appropriate.
- Use Server Actions or Route Handlers for secure mutations.
- Use Supabase Auth for identity.
- Use Supabase PostgreSQL for relational data.
- Use RLS for user-owned data.
- Use Zod for validation.
- Use Tailwind for styling.
- Use cache tags for public catalog invalidation.

Avoid:

- Separate backend service too early.
- Redis before there is a concrete need.
- Client-side scoring.
- Client-side permission enforcement as the source of truth.
- Complex versioning before the MVP needs it.
- Multiple question types before `single_choice` is excellent.

---

# 4. Files to Treat as Source of Truth

Use these project documents together:

- `Architecture-Essentials.md` for the practical build guide.
- `Architecture.txt` for the fuller architecture reference.
- `Agents.md` for general agent behavior.
- `Codex.md` for Codex-specific working behavior.

If documents conflict, prefer:

1. Newer user instruction.
2. `Architecture-Essentials.md`.
3. `Architecture.txt`.
4. Older planning notes.

---

# 5. Codex Working Rules

Before making implementation changes:

- Inspect the existing codebase.
- Follow existing patterns when they are reasonable.
- Preserve user changes.
- Keep changes scoped to the request.
- Explain meaningful tradeoffs briefly.

When editing:

- Prefer TypeScript-safe changes.
- Keep business logic out of UI components.
- Keep scoring and validation testable.
- Use explicit server-side checks.
- Do not introduce unnecessary dependencies.
- Add tests where the risk justifies it.

When reviewing:

- Lead with bugs, risks, regressions, and missing tests.
- Pay special attention to RLS, answer leakage, timers, autosave, and submission.

---

# 6. MVP Scope Guardrails

Build now:

- Supabase Auth.
- Profiles and roles.
- Exams, subjects, topics.
- Single-choice questions.
- Question options.
- Tests and test questions.
- Published test catalog.
- Timed attempts.
- Autosave.
- Server-side scoring.
- Result and review.
- Basic admin CRUD.

Postpone:

- Redis.
- Leaderboards.
- Payments.
- AI tutoring.
- Advanced analytics.
- Adaptive tests.
- Native mobile apps.
- Institution accounts.
- Full content versioning.
- Complex review workflow.

Keep the project boring where boring is safer.

---

# 7. Test Engine Checklist

For any work touching active tests, verify:

- Correct answers are not sent to the client.
- Attempt ownership is checked.
- Attempt status is checked.
- Expiry is checked with server time.
- Answer option belongs to the question.
- Question belongs to the test.
- Submitted attempts reject answer changes.
- Expired attempts reject answer changes.
- Submission is idempotent.
- Score is calculated server-side.
- Result summary is persisted.

This checklist is mandatory for test-engine work.

---

# 8. Autosave Checklist

Autosave must handle:

- Slow network.
- Failed request.
- Rapid answer changes.
- Browser refresh.
- Duplicate tabs.
- Expired attempt.
- Submitted attempt.

UI should clearly represent:

```text
Saving
Saved
Retrying
Failed to save
```

Never show a confident saved state before the server confirms.

---

# 9. Timer Checklist

Timer must be based on:

```text
started_at
expires_at
server_time
```

Do not trust:

- Browser clock.
- Local countdown alone.
- Hidden tab timing behavior.
- Client-submitted elapsed time.

If the timer expires:

- Stop accepting answer changes.
- Submit or expire the attempt using saved answers.
- Return a stable result or expired state.

---

# 10. Admin Content Checklist

Before publishing a test:

- Test has at least one question.
- Duration is valid.
- Every question has valid options.
- Every `single_choice` question has exactly one correct option.
- Marks and negative marks are valid.
- Questions are published or allowed for inclusion.
- Question order is stable.

After attempts exist:

- Do not change correct answers, marks, options, or question meaning.
- Archive and copy if meaningful correction is required.
- Audit sensitive changes.

---

# 11. RLS Review Checklist

For every data access path, check:

- Who can read this?
- Who can insert this?
- Who can update this?
- Who can delete this?
- Can a student access another student's data?
- Can a student infer correct answers?
- Can an editor escalate privileges?
- Is service role usage server-only?

RLS mistakes can be quiet and dangerous, so Codex should treat them as high-risk.

---

# 12. Caching Checklist

Safe to cache:

- Exam list.
- Subject list.
- Topic list.
- Published test metadata.
- Public catalog pages.
- Static assets.

Do not aggressively cache:

- Active attempts.
- Current answers.
- Submission state.
- Timer enforcement.
- Private results.
- Student dashboards.
- Correct-answer payloads.

After admin publish/update actions, revalidate relevant cache tags.

---

# 13. Testing Guidance

Codex should prioritize tests for:

- Scoring.
- Negative marking.
- Attempt expiry.
- Duplicate submit.
- Autosave behavior.
- RLS policies.
- Admin publish validation.

End-to-end tests should cover:

- Student takes and submits a test.
- Student refreshes during a test.
- Student returns after expiry.
- Same attempt is opened in two tabs.
- Admin creates and publishes a test.

---

# 14. Implementation Tone

Prefer:

- Clear, boring, reliable code.
- Small focused modules.
- Server-side validation.
- Explicit permission checks.
- Practical tests.
- Gradual enhancement.

Avoid:

- Clever abstractions without payoff.
- Premature infrastructure.
- Feature sprawl.
- UI-only security.
- Large refactors unrelated to the task.

---

# 15. Final Reminder

This project succeeds if students can trust that their answers are saved, their timer is fair, their result is accurate, and their data is private.

Everything else comes after that.
