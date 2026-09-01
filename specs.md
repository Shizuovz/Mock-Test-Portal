# Technical Specification (Specs)
## Online Mock Test and Exam Preparation Platform

**Document Version:** 1.0  
**Status:** Active  
**Last Updated:** August 2026  
**Primary Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage)

---

## 1. System Overview & Technology Stack

| Layer | Technology | Specification Details |
|---|---|---|
| **Framework** | Next.js (App Router) | React Server Components, Server Actions, Route Handlers, Middleware |
| **Language** | TypeScript | Strict type checking (`noImplicitAny`, strict null checks), Zero `tsc` errors |
| **Styling** | Tailwind CSS & CSS Variables | Responsive design, distraction-free test layouts, curated neutral & emerald palette |
| **Client State** | Zustand / React State | Zustand used exclusively for active test UI interactions (palette, timer, answers) |
| **Validation** | Zod | Runtime validation for forms, CSV imports, API payloads, and query parameters |
| **Database** | Supabase (PostgreSQL 15+) | Strongly typed relational schema, composite unique constraints, foreign keys |
| **Auth & Security** | Supabase Auth + RLS | Cookie-based SSR sessions, Row Level Security, role checks (`student`, `editor`, `admin`) |
| **Testing** | Vitest | Unit & compliance testing for scoring, timers, schemas, roles, and live DB checks |

---

## 2. Complete Database Schema Specification

### 2.1 Core Entities & Columns

#### `profiles` (User metadata & roles)
- `id` (uuid, PK, references `auth.users(id)` on delete cascade)
- `full_name` (text, nullable)
- `avatar_url` (text, nullable)
- `role` (text, enum: `'student'`, `'editor'`, `'admin'`, default: `'student'`)
- `created_at` (timestamptz, default: `now()`)
- `updated_at` (timestamptz, default: `now()`)

#### `exams` (Top-level examination categories)
- `id` (uuid, PK, default: `gen_random_uuid()`)
- `name` (text, not null)
- `slug` (text, unique, not null)
- `description` (text, nullable)
- `logo_url` (text, nullable)
- `is_active` (boolean, not null, default: `true`)
- `created_at` (timestamptz, default: `now()`)
- `updated_at` (timestamptz, default: `now()`)

#### `subjects` (Exam subjects)
- `id` (uuid, PK, default: `gen_random_uuid()`)
- `exam_id` (uuid, not null, references `exams(id)` on delete cascade)
- `name` (text, not null)
- `slug` (text, not null)
- `description` (text, nullable)
- `order_index` (integer, not null, default: `0`)
- `created_at` (timestamptz, default: `now()`)
- `updated_at` (timestamptz, default: `now()`)
- **Constraints:** `unique (exam_id, slug)`

#### `topics` (Subject-specific topics)
- `id` (uuid, PK, default: `gen_random_uuid()`)
- `subject_id` (uuid, not null, references `subjects(id)` on delete cascade)
- `name` (text, not null)
- `slug` (text, not null)
- `description` (text, nullable)
- `order_index` (integer, not null, default: `0`)
- `created_at` (timestamptz, default: `now()`)
- `updated_at` (timestamptz, default: `now()`)
- **Constraints:** `unique (subject_id, slug)`

#### `questions` (Reusable Question Bank)
- `id` (uuid, PK, default: `gen_random_uuid()`)
- `topic_id` (uuid, not null, references `topics(id)` on delete restrict)
- `question_text` (text, not null)
- `question_type` (text, not null, default: `'single_choice'`)
- `difficulty` (text, nullable: `'easy'`, `'medium'`, `'hard'`)
- `explanation` (text, nullable)
- `default_marks` (numeric, not null, default: `1`)
- `default_negative_marks` (numeric, not null, default: `0`)
- `status` (text, not null, enum: `'draft'`, `'published'`, `'archived'`, default: `'draft'`)
- `created_by` (uuid, nullable, references `profiles(id)` on delete set null)
- `created_at` (timestamptz, default: `now()`)
- `updated_at` (timestamptz, default: `now()`)

#### `question_options` (Normalized question choices)
- `id` (uuid, PK, default: `gen_random_uuid()`)
- `question_id` (uuid, not null, references `questions(id)` on delete cascade)
- `option_text` (text, not null)
- `is_correct` (boolean, not null, default: `false`)
- `order_index` (integer, not null, default: `1`)
- `created_at` (timestamptz, default: `now()`)
- `updated_at` (timestamptz, default: `now()`)

#### `tests` (Mock Test configurations)
- `id` (uuid, PK, default: `gen_random_uuid()`)
- `exam_id` (uuid, not null, references `exams(id)` on delete cascade)
- `name` (text, not null)
- `slug` (text, not null)
- `description` (text, nullable)
- `duration_minutes` (integer, not null, check: `duration_minutes > 0`)
- `total_marks` (numeric, nullable)
- `passing_marks` (numeric, nullable)
- `is_published` (boolean, not null, default: `false`)
- `starts_at` (timestamptz, nullable)
- `ends_at` (timestamptz, nullable)
- `created_by` (uuid, nullable, references `profiles(id)` on delete set null)
- `created_at` (timestamptz, default: `now()`)
- `updated_at` (timestamptz, default: `now()`)
- **Constraints:** `unique (exam_id, slug)`

#### `test_questions` (Junction linking questions into tests)
- `id` (uuid, PK, default: `gen_random_uuid()`)
- `test_id` (uuid, not null, references `tests(id)` on delete cascade)
- `question_id` (uuid, not null, references `questions(id)` on delete restrict)
- `order_index` (integer, not null)
- `marks` (numeric, nullable)
- `negative_marks` (numeric, nullable)
- `created_at` (timestamptz, default: `now()`)
- **Constraints:** `unique (test_id, question_id)`, `unique (test_id, order_index)`

#### `test_attempts` (Student active and completed test sessions)
- `id` (uuid, PK, default: `gen_random_uuid()`)
- `user_id` (uuid, not null, references `profiles(id)` on delete cascade)
- `test_id` (uuid, not null, references `tests(id)` on delete restrict)
- `status` (text, not null, enum: `'in_progress'`, `'submitted'`, `'expired'`, `'cancelled'`, default: `'in_progress'`)
- `started_at` (timestamptz, not null, default: `now()`)
- `expires_at` (timestamptz, not null)
- `submitted_at` (timestamptz, nullable)
- `score` (numeric, nullable)
- `max_score` (numeric, nullable)
- `correct_count` (integer, nullable)
- `wrong_count` (integer, nullable)
- `unanswered_count` (integer, nullable)
- `time_taken_seconds` (integer, nullable)
- `created_at` (timestamptz, default: `now()`)
- `updated_at` (timestamptz, default: `now()`)

#### `user_answers` (Autosaved student answers during an attempt)
- `id` (uuid, PK, default: `gen_random_uuid()`)
- `attempt_id` (uuid, not null, references `test_attempts(id)` on delete cascade)
- `question_id` (uuid, not null, references `questions(id)` on delete restrict)
- `selected_option_id` (uuid, nullable, references `question_options(id)` on delete restrict)
- `is_marked_for_review` (boolean, not null, default: `false`)
- `answered_at` (timestamptz, default: `now()`)
- `created_at` (timestamptz, default: `now()`)
- `updated_at` (timestamptz, default: `now()`)
- **Constraints:** `unique (attempt_id, question_id)`

#### `bookmarks` (User saved questions)
- `id` (uuid, PK, default: `gen_random_uuid()`)
- `user_id` (uuid, not null, references `profiles(id)` on delete cascade)
- `question_id` (uuid, not null, references `questions(id)` on delete cascade)
- `created_at` (timestamptz, default: `now()`)
- **Constraints:** `unique (user_id, question_id)`

#### `audit_logs` (Security & administrative audit trail)
- `id` (uuid, PK, default: `gen_random_uuid()`)
- `actor_id` (uuid, nullable, references `profiles(id)` on delete set null)
- `action` (text, not null)
- `entity_type` (text, not null)
- `entity_id` (uuid, nullable)
- `metadata` (jsonb, nullable)
- `created_at` (timestamptz, default: `now()`)

---

## 3. Row Level Security (RLS) Policy Specifications

| Table | Operation | RLS Policy Rule |
|---|---|---|
| `profiles` | `SELECT` | Publicly readable for authenticated users |
| `profiles` | `UPDATE` | User can update own profile OR `role = 'admin'` |
| `exams`, `subjects`, `topics`, `tests` | `SELECT` | Allow public read if `is_published = true` / `is_active = true`; All rows viewable by `editor` or `admin` |
| `exams`, `subjects`, `topics`, `tests` | `INSERT / UPDATE / DELETE` | Restricted to `editor` or `admin` |
| `questions`, `question_options` | `SELECT` | Editors/Admins see all; Active test engine queries use safe projections without `is_correct` |
| `test_attempts` | `SELECT` | `user_id = auth.uid()` OR `role = 'admin'` |
| `test_attempts` | `INSERT` | Authenticated user (`user_id = auth.uid()`) |
| `test_attempts` | `UPDATE` | `user_id = auth.uid()` AND `status = 'in_progress'` (Locked after submit/expiry) |
| `user_answers` | `ALL` | Attempt must belong to current user: `attempt_id IN (SELECT id FROM test_attempts WHERE user_id = auth.uid())` |
| `bookmarks` | `ALL` | User owns bookmark: `user_id = auth.uid()` |
| `audit_logs` | `SELECT / INSERT` | Server-only insert via Service Role Key; Read restricted to `admin` |

---

## 4. Application Routes Specification

### Public Routes
- `/`: Landing page highlighting key exam categories and CTAs.
- `/exams`: Comprehensive examination directory.
- `/exams/[slug]`: Specific exam detail page with subjects and available test listing.

### Authentication Routes
- `/login`: Secure email/password login with error state display.
- `/register`: Student account registration with initial profile setup.
- `/forgot-password`: Password reset request triggering Supabase Auth email.

### Student Dashboard Routes
- `/dashboard`: Overall student progress, recent attempts, test completion counts, and quick-action navigation.
- `/dashboard/tests`: Filterable catalog of available mock tests by exam, difficulty, and completion status.
- `/dashboard/results`: Chronological history of submitted/expired attempts with score percentages.
- `/dashboard/bookmarks`: Directory of bookmarked questions complete with options, correct answer indicator, and explanations.
- `/dashboard/performance`: Weak-topic diagnostic dashboard identifying topics with $<60\%$ accuracy.

### Test-Taking Engine Routes
- `/test/[testId]`: Active timed test interface. Server loads sanitized question payload and calculates server timer.
- `/test/[testId]/instructions`: Test preamble stating question count, duration, marking scheme, and rules before attempt begins.
- `/test/[testId]/result`: Post-submission result review displaying score, percentage, subject breakdown, and question-by-question review.

### Administrator Routes
- `/admin`: Overview metrics and recent attempt monitoring.
- `/admin/exams`: Exam CRUD management with slugs and activation toggles.
- `/admin/subjects`: Subject management grouped by exam.
- `/admin/topics`: Topic management grouped by subject.
- `/admin/questions`: Question bank with search, filters, pagination, and question editor.
- `/admin/questions/import`: CSV bulk question import preview and batch validator.
- `/admin/tests`: Mock test builder (configure duration, marks, question ordering, and publish status).
- `/admin/attempts`: Real-time session inspector of student attempts.
- `/admin/users`: User management and role assignment (`student`, `editor`, `admin`).
- `/admin/reports`: Aggregate platform reports and question difficulty distributions.

---

## 5. Test Engine Mechanics & Data Contract

### 5.1 Safe Question Payload (During Active Attempt)
Active students **must never** receive correct answers or explanations over the wire.
```typescript
type SafeQuestionOption = {
  id: string;
  optionText: string;
  orderIndex: number;
};

type SafeQuestionPayload = {
  id: string;
  questionText: string;
  questionType: "single_choice";
  marks: number;
  negativeMarks: number;
  options: SafeQuestionOption[]; // Notice: is_correct is NOT included
};
```

### 5.2 Server-Authoritative Timer
```text
started_at  = Server timestamp at attempt creation
expires_at  = started_at + (test.duration_minutes * 60 * 1000)
remaining_s = max(0, ceil((expires_at - now) / 1000))
```
- **If remaining_s == 0**: Server automatically locks the attempt, rejects incoming answer saves, and executes scoring.

### 5.3 Autosave Data Contract
- **Endpoint**: `POST /api/attempts/[attemptId]/answers`
- **Payload**:
  ```json
  {
    "questionId": "uuid",
    "selectedOptionId": "uuid | null",
    "isMarkedForReview": false
  }
  ```
- **Database Action**: Upsert on `(attempt_id, question_id)`.
- **Validation**: Attempt must be owned by caller, status must be `in_progress`, and current server time must be `< expires_at`.

### 5.4 Submission & Server-Side Scoring Contract
- **Endpoint**: `POST /api/attempts/[attemptId]/submit`
- **Idempotency Guarantee**: If the attempt status is already `'submitted'`, the endpoint returns the existing stored result without recalculating or modifying data.
- **Scoring Formula (Single Choice)**:
  $$\text{score} = \sum_{\text{correct}} \text{marks} - \sum_{\text{wrong}} \text{negative\_marks}$$
  $$\text{percentage} = \text{round}\left(\frac{\text{score}}{\text{max\_score}} \times 100\right)$$
- **Persisted Metrics**:
  - `score`, `max_score`, `correct_count`, `wrong_count`, `unanswered_count`, `time_taken_seconds`, `submitted_at`, `status = 'submitted'`.

---

## 6. Bulk CSV Import Specification

### Required CSV Columns
```text
exam,subject,topic,question_text,option_a,option_b,option_c,option_d,correct_option,explanation,difficulty,marks,negative_marks
```

### Validation Rules
1. **`exam`**: Required string. Matches existing exam (case-insensitive) or automatically creates a new active exam.
2. **`subject`**: Required string. Matches existing subject under the exam or creates a new one.
3. **`topic`**: Required string. Matches existing topic under the subject or creates a new one.
4. **`question_text`**: Required non-empty string.
5. **`option_a`, `option_b`, `option_c`, `option_d`**: All 4 options are mandatory.
6. **`correct_option`**: Must resolve to `A`, `B`, `C`, or `D` (numeric values `1`, `2`, `3`, `4` accepted and mapped).
7. **`difficulty`**: Must be `easy`, `medium`, or `hard` (defaults to `medium` if empty).
8. **`marks`**: Positive numeric value (defaults to `1`).
9. **`negative_marks`**: Non-negative numeric value (defaults to `0`).

---

## 7. Caching & Invalidation Architecture

### Cache Tags Matrix
- **`exams`**: Revalidated when any exam is created, renamed, or deactivated.
- **`exam:{examId}`**: Revalidated when exam metadata or test assignments change.
- **`subjects`** / **`subject:{subjectId}`**: Revalidated upon subject CRUD.
- **`topics`** / **`topic:{topicId}`**: Revalidated upon topic CRUD.
- **`tests`**: Revalidated upon test creation, publishing, or unpublishing.
- **`test:{testId}`**: Revalidated upon test metadata updates.
- **`questions:{testId}`**: Revalidated when questions in a test are modified or reordered.

### Never Cached
- `/test/[testId]` (Active attempt session)
- `/api/attempts/*` (Live autosaves and timer state)
- `/dashboard/*` (Private student performance, bookmarks, attempt history)
- `/admin/*` (Content management mutations and audit logs)
