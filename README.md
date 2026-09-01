# Mock Test Portal

Online MCQ mock-test platform built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.

## Project Context

Read these files before changing architecture or implementation direction:

- `PRD.md`
- `Architecture-Essentials.md`
- `Architecture.md`
- `Agents.md`
- `Codex.md`

## First MVP Slice

```text
Register/Login
  -> Browse exam/test
  -> Start timed MCQ test
  -> Autosave answers
  -> Submit attempt
  -> Score on server
  -> Show result and answer review
```

## Local Setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add Supabase values before enabling live authentication/database calls.

## Supabase Setup

In the Supabase dashboard for `Mock_Test_Portal`, copy these values into
`.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. It is used by trusted route
handlers for sensitive scoring and safe question payload generation.

Apply SQL in this order from the Supabase SQL editor:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/policies/profiles.sql`
3. `supabase/policies/content.sql`
4. `supabase/policies/attempts.sql`
5. `supabase/policies/bookmarks.sql`
6. `supabase/seed.sql`
