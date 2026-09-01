# Project Context & Overview
## Online Mock Test and Exam Preparation Platform

**Last Updated:** September 2026  
**Repository:** [https://github.com/Shizuovz/Mock-Test-Portal.git](https://github.com/Shizuovz/Mock-Test-Portal.git)  
**Primary Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Supabase (PostgreSQL 15+, Supabase Auth, Storage)

---

## 1. Project Purpose & Core Workflow

The **Mock Test Portal** is a production-grade, secure, and responsive web platform for competitive examination preparation and online timed MCQ testing.

### The Core Critical Path:
```text
Student Registration / Login
  └── Browse Exam & Test Catalog (/exams, /exams/[examSlug])
       └── View Test Instructions & Duration (/test/[testId]/instructions)
            └── Start Timed MCQ Test Attempt (/test/[testId])
                 ├── Real-time timer synchronized with server expires_at
                 ├── KaTeX LaTeX equation rendering for STEM questions
                 ├── Answer autosaving (/api/attempts/[attemptId]/answers)
                 └── Submit Attempt (/api/attempts/[attemptId]/submit)
                      └── Server-Side Scoring & Result Summary Generation
                           └── Detailed Solutions & Performance Review (/test/[testId]/result)
```

---

## 2. Non-Negotiable Engineering & Security Principles

1. **Zero Answer Leakage (`ADR 003`):**
   - Active test payloads (`safe-payload.ts`) delivered to the student browser strictly strip `is_correct`, `correctOptionId`, and `explanation`.
   - Solutions and answer keys are joined exclusively server-side upon attempt completion.
2. **Server-Authoritative Timing (`ADR 004`):**
   - Attempt duration is fixed at start time: `expires_at = started_at + duration_minutes`.
   - Client clock cannot be manipulated to gain extra time. Expired attempts automatically reject saves and trigger scoring.
3. **Server-Side Scoring with Negative Marking (`ADR 005`):**
   - The browser never computes scores. Single-choice evaluation logic calculates total marks, negative penalties, accuracy, and subject/topic metrics on the server.
4. **Idempotent Submission & Attempt Locking:**
   - Once submitted or expired, attempts are locked against further writes via database constraints and API validation.
5. **Strict Data Access & Role-Based Security:**
   - Role hierarchy: `student` (default), `editor`, `admin`.
   - Supabase Row Level Security (RLS) ensures students can only read active tests and their own attempts/bookmarks.
   - `SUPABASE_SERVICE_ROLE_KEY` is reserved exclusively for server-side trusted actions and route handlers.

---

## 3. Architecture & Directory Structure

```text
Mock_Test_Portal/
├── PRD.md                       # Product Requirements Document
├── Architecture.md              # Detailed System Architecture
├── Architecture-Essentials.md   # Architectural reference guide
├── specs.md                     # Database schema, entity relationships, & API specs
├── decision.md                  # Architecture Decision Records (ADR 001 - 008)
├── Agents.md                    # Guidelines & behavioral boundaries for AI agents
├── deployment.md                # Vercel & Supabase deployment checklist
├── context.md                   # Complete high-level project summary (this file)
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Login, register, forgot-password
│   │   ├── (public)/exams/      # Public exam catalog & SEO pages (/exams/[examSlug])
│   │   ├── admin/               # Admin dashboards (questions, tests, exams, bulk-import)
│   │   ├── dashboard/           # Student portal (recent tests, bookmarks, performance)
│   │   ├── test/[testId]/       # Test execution shell, instructions, & results
│   │   ├── api/attempts/        # Secure attempt lifecycle & scoring route handlers
│   │   └── api/webhooks/        # External integrations (e.g., Stripe)
│   │
│   ├── components/
│   │   ├── admin/               # Question form, bulk import preview, test builder
│   │   ├── dashboard/           # Stats cards, weak topic analysis, attempt history
│   │   ├── layout/              # App header, navigation, sidebar
│   │   ├── test/                # Active test shell, palette, countdown timer, review
│   │   └── ui/                  # MathText (KaTeX), modal dialogs, reusable UI primitives
│   │
│   ├── lib/
│   │   ├── actions/             # Next.js Server Actions (auth, content, bookmarks)
│   │   ├── admin/               # Bulk import parser, test publisher, question bank logic
│   │   ├── auth/                # Role validation & permissions helpers
│   │   ├── math/                # KaTeX LaTeX parsing & safe math expression rendering
│   │   ├── scoring/             # Pure scoring algorithms (single-choice, negative marks)
│   │   ├── supabase/            # Browser client, server client, & admin client
│   │   ├── test-engine/         # Safe payload generator, timer sync, autosave, submission
│   │   └── validation/          # Zod runtime schemas (content, attempt, auth, CSV import)
│   │
│   ├── stores/                  # Zustand client store for active test state & palette
│   └── types/                   # TypeScript domain contracts & Supabase database types
│
├── supabase/
│   ├── migrations/              # SQL schema migrations (0001_initial, 0002_retakes, 0003_pacing)
│   ├── policies/                # Row Level Security (RLS) policies
│   └── seed.sql                 # Development seed data for exams, subjects, questions
│
└── tests/
    ├── e2e/                     # Playwright end-to-end specifications
    └── rls/                     # Supabase RLS test scripts
```

---

## 4. Current Feature Implementation Status

| Feature Domain | Status | Key Highlights |
|---|---|---|
| **Database & Schema** | ✅ Completed | 12 core tables verified (Exams, Subjects, Topics, Questions, Options, Tests, Attempts, Answers, Summaries, Bookmarks, Retake Policies, Pacing Analytics). |
| **Authentication & RBAC** | ✅ Completed | Supabase Auth with cookie sessions; role checks for `student`, `editor`, and `admin`. |
| **Public Exam Catalog** | ✅ Completed | Server-rendered SEO pages, Schema.org Course JSON-LD, metadata generation. |
| **Test Engine** | ✅ Completed | Timed MCQ tests, safe question delivery, answer autosave, idempotent submit, and server scoring. |
| **Active Test Interface** | ✅ Completed | Distraction-free shell, question palette, status filters, question bookmarking, review dialog. |
| **Math / KaTeX Rendering** | ✅ Completed | Support for inline `$...$` and block `$$...$$` LaTeX equations in question text and solutions. |
| **Result & Solution Review** | ✅ Completed | Score summary, accuracy %, question-by-question breakdown, and detailed explanations. |
| **Admin Question Bank** | ✅ Completed | Filterable question manager, CSV/JSON bulk import with Zod validation. |
| **Test Builder & Publishing** | ✅ Completed | Draft to published lifecycle, test duration, passing marks, and retake policies. |
| **Student Dashboard** | ✅ Completed | Attempt history, weak topic highlights, bookmarked question repository. |
| **Automated Testing** | ✅ Completed | 12 Vitest suites (38/38 tests passing) covering scoring, timer drift, KaTeX parser, schemas, and live database checks. |

---

## 5. Environment Configuration

The application requires the following environment variables (defined in `.env.example` / `.env.local`):

```bash
# Public (Browser Accessible)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-or-publishable-key"

# Server-Only (Never Expose to Browser)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Next.js App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 6. How to Run Locally

```bash
# Install dependencies
npm install

# Run Vitest test suite
npx vitest run

# Run development server
npm run dev

# Run Playwright E2E tests
npx playwright test
```
