# Decision Log & Architecture Decision Records (ADRs)
## Online Mock Test and Exam Preparation Platform

**Document Version:** 1.0  
**Status:** Active  
**Last Updated:** August 2026  
**Primary Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage)

---

## 1. Purpose of This Document

This document records the foundational architectural, product, and implementation decisions made for the Mock Test Portal. It explains the context, rationale, trade-offs, and consequences of each decision so that future contributors, agents, and maintainers preserve system integrity and avoid accidental regressions.

---

## 2. Core Architecture Decision Records

### ADR 001: Next.js as a Unified Full-Stack Monolith
- **Status:** Accepted & Implemented
- **Decision:** Build the entire application as a single Next.js codebase (Server Components, Server Actions, Route Handlers, and Middleware) deployed to Vercel.
- **Context:** Deciding between a standalone backend (e.g., Express/FastAPI/NestJS) + separate frontend vs. an integrated full-stack framework.
- **Rationale:** The MVP does not need the operational overhead of microservices or separate deployment pipelines. Next.js handles server rendering, route protection, API endpoints, server-only secret handling, and selective caching in a single deployable unit.
- **Consequence:** Deployment is simple and atomic. If high-throughput background processing or dedicated websocket services are needed later, they can be extracted as standalone services without disturbing the core domain.

---

### ADR 002: Supabase (PostgreSQL) Over Firebase / NoSQL
- **Status:** Accepted & Implemented
- **Decision:** Use Supabase PostgreSQL as the primary database, authentication provider, and storage engine.
- **Context:** Evaluating relational SQL (PostgreSQL) vs. document NoSQL (Firestore / MongoDB).
- **Rationale:** The mock test domain is deeply relational:
  $$\text{Exam} \rightarrow \text{Subject} \rightarrow \text{Topic} \rightarrow \text{Question} \rightarrow \text{Question Options}$$
  $$\text{Test} \rightarrow \text{Test Questions} \rightarrow \text{Questions}$$
  $$\text{User} \rightarrow \text{Test Attempt} \rightarrow \text{User Answers} \rightarrow \text{Result Summary}$$
  Integrity requires foreign keys, composite unique constraints (`unique(attempt_id, question_id)`, `unique(test_id, order_index)`), and transactional aggregations. PostgreSQL is a natural fit.
- **Consequence:** Requires designing explicit Row Level Security (RLS) policies, but guarantees data integrity that document databases cannot easily enforce.

---

### ADR 003: Server-Side Exclusive Scoring (Zero Answer Leakage)
- **Status:** Accepted & Implemented
- **Decision:** All scoring must occur exclusively on the server. Active test question payloads delivered to the browser must strictly omit `is_correct`, `correctOptionId`, and `explanation`.
- **Context:** Some quiz apps evaluate answers on the client for immediate feedback, exposing correct answers in JavaScript memory or network payloads.
- **Rationale:** In an exam preparation portal, answers must remain strictly confidential during an attempt. Client-side evaluation makes cheating trivial via browser DevTools inspection.
- **Consequence:** Active test questions project only `{ id, questionText, questionType, marks, negativeMarks, options: [{ id, optionText, orderIndex }] }`. The server joins with correct answers only after attempt submission.

---

### ADR 004: Server-Authoritative Timers & Expiry
- **Status:** Accepted & Implemented
- **Decision:** Attempt duration and expiry are calculated server-side:
  $$\text{expires\_at} = \text{started\_at} + \text{duration\_minutes}$$
  The client countdown is purely a presentation layer calculated from $\text{expires\_at} - \text{server\_time}$.
- **Context:** Preventing students from manipulating browser clocks, pausing JavaScript timers, or keeping tabs inactive to gain unfair time.
- **Rationale:** Manipulating the local machine clock must never extend test time. When $\text{expires\_at}$ has passed, the server automatically rejects further answer saves and marks the attempt submitted/expired.
- **Consequence:** Resuming after page reload or network drop accurately recalculates remaining time without timer drift.

---

### ADR 005: Idempotent Submission & Conflict Resolution
- **Status:** Accepted & Implemented
- **Decision:** Test submission is strictly idempotent and locks the attempt from further answer modifications.
- **Context:** Handling double-clicks on submit buttons, simultaneous timer auto-submit and manual submit, or the same attempt open in multiple tabs.
- **Rationale:** If an attempt is submitted twice, the second request must return the already calculated and stored result summary rather than recalculating scores or producing duplicate entries.
- **Consequence:** Answers cannot be changed after submission or expiry. Upsert on `(attempt_id, question_id)` prevents answer record duplication across tabs.

---

### ADR 006: Selective Caching (Public vs. Private State)
- **Status:** Accepted & Implemented
- **Decision:** Cache shared public catalog data using Next.js cache tags (`exams`, `exam:{id}`, `tests`, `test:{id}`). Never cache active attempts, student answers, timer countdowns, or private dashboards.
- **Context:** Maximizing performance without causing stale data leaks between students.
- **Rationale:** Thousands of students view identical exam and test listing pages; these can be cached at the CDN/Vercel layer. Student attempts and scoring must always be fetched fresh from PostgreSQL.
- **Consequence:** High performance for browsing catalogs with instantaneous revalidation upon admin edits (`revalidateTag`), and zero risk of stale test attempt state.

---

### ADR 007: Deferring Redis Until Proven Scale Need
- **Status:** Accepted & Implemented
- **Decision:** Do not include Redis in the MVP stack.
- **Context:** Whether to introduce Redis early for caching, rate limiting, and session state.
- **Rationale:** The combination of Next.js Data Cache, Vercel Edge CDN, PostgreSQL memory caching, and Supabase connection pooling (Supavisor) comfortably handles MVP traffic without the operational cost of managing a Redis cluster.
- **Consequence:** Redis will be introduced in future phases if real-time live leaderboards or distributed queue locks become necessary.

---

### ADR 008: Archive-and-Copy Rule for Content Versioning
- **Status:** Accepted & Implemented
- **Decision:** In the MVP, do not build a complex branching/versioning engine. Instead, enforce the **Archive-and-Copy** operational rule.
- **Rule Details:**
  1. Draft content can be modified freely.
  2. Published content with existing student attempts cannot have correct answers, options, marks, or core question text modified in-place.
  3. If a substantive correction is needed on a published test/question, archive the old version and publish a new copy.
- **Rationale:** Mutating correct options on live tests corrupts historical attempt scores and analytics. A full git-like branching engine adds immense schema complexity for an MVP.
- **Consequence:** Historical test attempt integrity is 100% preserved with zero schema bloat.

---

### ADR 009: Separation of CSV Parser from Server Actions
- **Status:** Accepted & Implemented
- **Decision:** The bulk question CSV parser (`bulk-import-parser.ts`) must remain 100% pure TypeScript with zero Node or server-only imports, while the database executor resides in server actions.
- **Context:** Next.js App Router prevents Client Components (`"use client"`) from importing modules that trace back to `next/headers` or server-only Supabase clients.
- **Rationale:** The client needs instant, responsive, in-browser spreadsheet parsing and validation without round-tripping to the server until the admin clicks "Confirm and Import".
- **Consequence:** Clean separation of concerns: instant client-side preview with zero server round-trips, followed by atomic server-side database insertion.

---

### ADR 010: Automated Weak-Topic Identification Threshold
- **Status:** Accepted & Implemented
- **Decision:** A topic is algorithmically flagged as **Weak** if student accuracy is below $60\%$ across attempted questions, and **Strong** if accuracy is $\ge 75\%$.
- **Context:** Defining actionable performance insights for students without overwhelming them with noisy flags.
- **Rationale:** $60\%$ represents the typical passing benchmark for competitive examinations. Flagging topics below this threshold provides immediate, prioritized focus areas.
- **Consequence:** Clean visual badges (`Needs Practice` vs `Strong` vs `Average`) that guide student study plans.

---

## 3. Decision Matrix Summary

| Area | Decision | Primary Benefit | Trade-off Accepted |
|---|---|---|---|
| **Framework** | Next.js App Router | Unified monolith, fast iteration | Tied to Vercel/Node runtime conventions |
| **Database** | Supabase PostgreSQL | Strong relational constraints, joins, RLS | Must maintain SQL policies and migrations |
| **Scoring** | Server-only idempotent | Guaranteed test integrity, zero cheating | Requires server round-trip on submit |
| **Timing** | Server-calculated $\Delta t$ | Immune to browser clock manipulation | Tab re-focus triggers server sync |
| **Caching** | Next.js Cache Tags | Fast public loads, instant admin revalidation | Must trigger explicit tags on publish |
| **Import** | Pure client CSV parser | Instant client validation and preview | Format must match expected column schema |
| **Versioning** | Archive-and-Copy | Protects historical attempt data | Admins cannot mutate live active questions |

---

## 4. Guidelines for Future Phases

When expanding into future roadmap items (e.g., Stripe monetization, live leaderboards, mobile PWA, multiple question types):
1. **Never compromise test integrity**: Answer evaluation and timers must remain server-authoritative.
2. **Never expose the Supabase service role key to the browser**: All privileged operations must run inside Server Actions or Route Handlers.
3. **Preserve the Archive-and-Copy rule**: Never mutate published questions that already have associated student attempt answers.
4. **Follow the established color and UI system**: Clean, distraction-free layouts using `#f7f8fa` (background), `#146b5f` (emerald primary), and `#d9dee7` (borders).
