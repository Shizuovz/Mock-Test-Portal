# Production Deployment Runbook
## Online Mock Test and Exam Preparation Platform

**Document Version:** 1.0  
**Status:** Active  
**Stack:** Next.js (App Router), Supabase (PostgreSQL, Auth, Storage), Vercel

---

## 1. Overview

This document provides step-by-step instructions for deploying the Mock Test Portal to production on **Vercel** connected to **Supabase Cloud**. Follow these procedures to ensure a secure, zero-downtime launch that preserves database constraints, Row Level Security (RLS), and server-only secrets.

---

## 2. Environment Variables Checklist

The application requires specific environment variables configured in your deployment environment (e.g. Vercel Project Settings > Environment Variables).

| Variable Name | Environment | Target Value / Format | Exposure | Purpose |
|---|:---:|---|:---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production & Preview | `https://<project-ref>.supabase.co` | **Public** (Browser & Server) | Supabase project API gateway |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production & Preview | `eyJhbGciOi...` (Anon/Public key) | **Public** (Browser & Server) | Client-side session and read authentication |
| `SUPABASE_SERVICE_ROLE_KEY` | Production & Preview | `eyJhbGciOi...` (Service Role key) | **CRITICAL SERVER-ONLY** | Bypasses RLS for secure scoring and admin mutations |
| `SUPABASE_DATABASE_URL` | Optional (CI/Migrations) | `postgresql://postgres:<pass>@...:5432/postgres` | **Server-Only** | Direct SQL connection for migration tooling |

> [!CAUTION]
> **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or prefix it with `NEXT_PUBLIC_`. It must only ever be accessible inside Next.js Server Components, Server Actions, and Route Handlers.

---

## 3. Supabase Cloud Setup

### Step 3.1: Create Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new organization or select an existing one.
3. Click **New Project**:
   - **Name**: `Mock Test Portal`
   - **Database Password**: Generate a secure 24+ character password and store it in your team password manager.
   - **Region**: Choose the region closest to your primary user base (e.g., `ap-south-1` Mumbai for Indian examinations like SSC/Banking/JEE).

### Step 3.2: Apply Schema Migrations
In the Supabase SQL Editor (or via Supabase CLI `supabase db push`):
1. Run the base schema migration file:
   - File: [`supabase/migrations/0001_initial_schema.sql`](file:///d:/PP/Mock_Test_Portal/supabase/migrations/0001_initial_schema.sql)
2. Run the Row Level Security (RLS) policies:
   - File: [`supabase/policies/profiles.sql`](file:///d:/PP/Mock_Test_Portal/supabase/policies/profiles.sql)
   - File: [`supabase/policies/content.sql`](file:///d:/PP/Mock_Test_Portal/supabase/policies/content.sql)
   - File: [`supabase/policies/attempts.sql`](file:///d:/PP/Mock_Test_Portal/supabase/policies/attempts.sql)
   - File: [`supabase/policies/bookmarks.sql`](file:///d:/PP/Mock_Test_Portal/supabase/policies/bookmarks.sql)

### Step 3.3: Configure Supabase Authentication
1. Navigate to **Authentication > URL Configuration**:
   - **Site URL**: `https://your-production-domain.com`
   - **Redirect URLs**: Add:
     - `https://your-production-domain.com/**`
     - `https://*-<your-team>.vercel.app/**` (for Vercel Preview deployments)
     - `http://localhost:3000/**` (for local development)
2. Navigate to **Authentication > Email Templates**:
   - Customize the **Confirmation** and **Reset Password** email templates with your platform name and brand colors (`#146b5f`).

---

## 4. Bootstrapping the First Administrator

When a new platform is first deployed, there are no administrative users. Follow this bootstrap procedure to create the first Super Administrator:

### Procedure
1. Visit your deployed portal registration page: `https://your-production-domain.com/register`.
2. Register an account with your administrative email address (e.g., `admin@yourplatform.com`).
3. Open the **Supabase Dashboard > SQL Editor** and execute the following SQL script to promote your profile to `admin`:

```sql
-- Replace with the email address you used to register
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@yourplatform.com'
);

-- Verify the promotion
SELECT id, full_name, role, updated_at 
FROM public.profiles 
WHERE role = 'admin';
```

4. Log out and log back in to the portal. You will now have full access to `/admin`, `/admin/exams`, `/admin/questions`, `/admin/questions/import`, `/admin/tests`, `/admin/attempts`, and `/admin/users`.
5. Subsequent administrators or editors can now be promoted directly from the UI at `/admin/users` without writing SQL!

---

## 5. Vercel Deployment

### Step 5.1: Connect Git Repository
1. Push your latest code to your GitHub / GitLab / Bitbucket repository:
   ```bash
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New... > Project** and import your repository.

### Step 5.2: Configure Build Settings
- **Framework Preset**: Next.js (automatically detected)
- **Root Directory**: `./`
- **Build Command**: `next build` (or `npm run build`)
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 5.3: Set Environment Variables
In the Vercel project configuration, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Step 5.4: Deploy & Verify
1. Click **Deploy**.
2. Once the build finishes, Vercel will assign a production URL (e.g., `https://mock-test-portal.vercel.app`).
3. Run an initial smoke test using the verification checklist below.

---

## 6. Pre-Flight Smoke Test Checklist

Once deployed to your production URL, perform this verification:

- [ ] **Public Landing Page (`/`)**: Loads with responsive layout and hero CTA.
- [ ] **Exam Directory (`/exams`)**: Renders published exams.
- [ ] **User Registration (`/register`)**: New student account creates user in `auth.users` and profile in `public.profiles`.
- [ ] **User Login (`/login`)**: Authenticates session and sets HTTP-only cookies.
- [ ] **Password Reset (`/forgot-password`)**: Sends reset email with link.
- [ ] **Available Tests (`/dashboard/tests`)**: Lists active mock tests with duration and marks.
- [ ] **Active Test Engine (`/test/[testId]`)**:
  - Timer counts down from server `expires_at`.
  - Question palette shows 5 status colors (Answered, Not Answered, Not Visited, Marked, Answered & Marked).
  - Answers autosave via `POST /api/attempts/[attemptId]/answers`.
- [ ] **Submission & Scoring (`/test/[testId]/result`)**:
  - Score, percentage, and accuracy calculated accurately on server.
  - Review filters (`All`, `✓ Correct`, `✕ Wrong`, `○ Unanswered`) filter questions cleanly.
  - Clicking `Bookmark question` saves to `/dashboard/bookmarks`.
- [ ] **Student Dashboard**:
  - `/dashboard/bookmarks`: Displays saved questions with options and explanations.
  - `/dashboard/performance`: Identifies weak topics ($<60\%$ accuracy) with practice time.
- [ ] **Admin Operations (`/admin`)**:
  - Accessible only to users with `role = 'admin'` or `'editor'`.
  - Anonymous users see `Permission required` with a login redirect.
  - CSV bulk import validates and imports questions with audit log entries.

---

## 7. Ongoing Maintenance & Operations

### Database Backups
- Supabase automatically performs daily database backups.
- For point-in-time recovery (PITR), enable PITR in the Supabase Database settings.

### Operational Content Versioning (The Archive-and-Copy Rule)
- **Do not edit live questions** that have existing student attempt records.
- If a question on a published test contains an error, archive the old question/test and publish a new version. This prevents retroactively altering students' historical scores.
