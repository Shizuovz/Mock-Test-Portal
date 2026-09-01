# Product Requirements Document (PRD)
## Online Mock Test and Exam Preparation Platform

**Document Version:** 1.0  
**Status:** Draft  
**Product Type:** Web-based exam preparation and online mock-test platform  
**Primary Stack:** Next.js, React, TypeScript, Tailwind CSS, Supabase  
**Initial Target:** Responsive web application  
**Future Expansion:** PWA/mobile experience, subscriptions, advanced analytics, live competitions  

---

# 1. Product Overview

The product will be an online exam-preparation platform where users can practice multiple-choice questions, take timed mock examinations, review their performance, identify weak areas, and track improvement over time.

The platform will support multiple examinations, subjects, topics, mock tests, and question banks.

Administrators will have a dedicated management system for creating questions, organizing content, constructing mock tests, managing users, publishing tests, and viewing platform analytics.

The primary product experience will focus on:

- Fast and distraction-free test taking.
- Accurate scoring.
- Reliable timers and autosaving.
- Detailed post-test analysis.
- Structured question-bank management.
- Student progress tracking.
- Strong security around answers and scoring.
- Scalability as the number of questions, users, and tests increases.

---

# 2. Product Vision

Create a reliable and scalable exam-preparation platform that gives learners an experience similar to real computer-based examinations while providing significantly better feedback and performance analytics afterward.

The platform should eventually become a complete preparation ecosystem rather than only a collection of online quizzes.

---

# 3. Product Goals

The initial student journey should be:

```text
Register
  -> Find an exam
  -> Select a mock test
  -> Start test
  -> Answer questions
  -> Submit
  -> Receive score
  -> Review answers
  -> Track performance
```

The initial administrator journey should be:

```text
Create exam
  -> Create subjects/topics
  -> Add questions
  -> Build test
  -> Publish test
  -> Review student performance
```

## Primary Goals

- Provide reliable online MCQ examinations.
- Support timed tests.
- Automatically save user answers.
- Score completed tests securely on the server.
- Provide answer explanations after submission.
- Support reusable and searchable question banks.
- Allow administrators to create and manage tests without developer involvement.
- Provide strong authentication and authorization.
- Build the application on a scalable architecture.

## Secondary Goals

- Encourage repeat practice.
- Help users identify weak subjects and topics.
- Provide historical performance tracking.
- Support free and premium content later.
- Allow expansion into multiple examination categories.

---

# 4. Non-Goals for Version 1

The MVP will intentionally avoid unnecessary complexity.

The following features are not required for the first release:

- Native Android application.
- Native iOS application.
- AI-generated questions.
- AI tutoring.
- Live multiplayer quizzes.
- Video courses.
- Discussion forums.
- Advanced gamification.
- Certificates.
- Referral programs.
- Complex subscription tiers.
- Offline examinations.
- Institution/teacher accounts.
- White-label deployments.
- Advanced adaptive testing.
- Real-time leaderboards.

The architecture should not prevent these features from being added later.

---

# 5. Target Users

## 5.1 Student

A registered user preparing for an examination.

Students should be able to:

- Create an account.
- Browse exams.
- Browse available tests.
- Take mock tests.
- Resume active tests when permitted.
- Review previous attempts.
- Review explanations.
- Bookmark questions.
- Track performance.
- See weak topics.
- Manage their profile.

## 5.2 Content Editor

A trusted user responsible for educational content.

Editors should be able to:

- Create questions.
- Edit questions.
- Organize questions.
- Add explanations.
- Import questions.
- Create draft tests.

Editors should not automatically receive full system administration permissions.

## 5.3 Administrator

An administrator manages the platform.

Administrators should be able to:

- Manage exams.
- Manage subjects.
- Manage topics.
- Manage questions.
- Manage tests.
- Publish/unpublish tests.
- Manage users.
- Manage editors.
- View attempts.
- View platform analytics.
- Configure examination rules.

---

# 6. User Roles

Initial roles:

- `student`
- `editor`
- `admin`

Role permissions must be enforced server-side and through Supabase Row Level Security where appropriate.

Frontend visibility alone must never be treated as authorization.

---

# 7. Information Architecture

The core educational hierarchy will be:

```text
Exam -> Subject -> Topic -> Question
```

Example:

```text
SSC CGL
|
├── Quantitative Aptitude
│   ├── Percentage
│   ├── Profit & Loss
│   ├── Ratio
│   └── Geometry
|
├── English
│   ├── Grammar
│   ├── Vocabulary
│   └── Comprehension
|
└── Reasoning
    ├── Analogy
    ├── Series
    └── Coding-Decoding
```

A question may then be assigned to one or more mock tests.

---

# 8. Core Product Areas

The platform will consist of six major areas:

- Public website.
- Authentication.
- Student dashboard.
- Test-taking interface.
- Results and review.
- Admin dashboard.

## 8.1 Public Website

Includes:

- Landing page.
- Exam directory.
- Exam details.
- Public test listings.
- Pricing page in future.
- About page.
- FAQ/help pages.
- Login.
- Registration.

## 8.2 Authentication

Users must be able to:

- Register.
- Login.
- Logout.
- Reset password.
- Verify email if enabled.
- Maintain authenticated sessions.

Authentication will use Supabase Auth.

Potential future authentication options:

- Google.
- Apple.
- Microsoft.

---

# 9. Student Dashboard

The dashboard will provide a summary of the student's preparation.

Possible dashboard metrics:

- Tests attempted.
- Tests completed.
- Total questions attempted.
- Overall accuracy.
- Average score.
- Best score.
- Recent attempts.
- Strongest subjects.
- Weakest subjects.
- Weakest topics.
- Time spent practicing.

Example:

```text
Overall Accuracy        74%
Tests Completed         18
Questions Attempted     620
Average Score           71%

Recent Attempts
--------------------------------
Mock Test 07            76%
Mock Test 06            68%
Mock Test 05            81%

Weak Topics
--------------------------------
Probability             54%
Geometry                61%
Current Affairs         63%
```

---

# 10. Exam Discovery

Students should be able to browse available examinations.

Each exam may contain:

- Name.
- Slug.
- Description.
- Logo/image.
- Subjects.
- Number of mock tests.
- Number of questions.
- Free/premium status.
- Active/inactive status.

Example route:

```text
/exams/ssc-cgl
```

---

# 11. Test Catalog

Users should be able to browse tests associated with an examination.

Each test listing should show:

- Test title.
- Number of questions.
- Duration.
- Total marks.
- Difficulty where applicable.
- Number of attempts.
- Free/premium status.
- Completion status for logged-in users.
- Best previous score where applicable.

Filters may include:

- Subject.
- Topic.
- Difficulty.
- Completed/not completed.
- Free/premium.

---

# 12. Test Types

The architecture should eventually support:

- Full mock tests.
- Subject tests.
- Topic tests.
- Practice tests.
- Previous-year papers.
- Daily quizzes.
- Custom generated tests.

The MVP primarily needs:

- Full mock tests.
- Subject/topic practice tests.

---

# 13. Starting a Test

When a student starts a test, the system must:

1. Authenticate the user.
2. Verify the test exists.
3. Verify the test is published.
4. Check access permissions.
5. Determine whether the student has an existing eligible attempt.
6. Create a `test_attempt`.
7. Store `started_at`.
8. Calculate or persist test expiry information.
9. Return the authorized question payload.
10. Open the test interface.

The server must remain authoritative for test timing and eligibility.

---

# 14. Test-Taking Interface

The test page is one of the highest-priority experiences in the product.

Desktop layout should contain:

- Test title.
- Test timer.
- Question number.
- Question text.
- Answer choices.
- Previous button.
- Save & Next button.
- Mark for Review.
- Question palette.
- Progress indicators.
- Submit Test button.

Example:

```text
┌─────────────────────────────────────────────────────┐
│ SSC CGL Mock Test 01               00:24:17         │
├──────────────────────────────────┬──────────────────┤
│ Question 14 of 50                │ Questions        │
│                                  │                  │
│ If x + 5 = 12, what is x?       │ 01 ✓ 02 ✓ 03 ○  │
│                                  │ 04 ✓ 05 ⚑ 06 ○  │
│ ○ 5                              │ 07 ✓ 08 ✓ 09 ○  │
│ ○ 6                              │                  │
│ ● 7                              │ ✓ Answered       │
│ ○ 8                              │ ⚑ Review         │
│                                  │ ○ Unanswered     │
│ [Previous]       [Save & Next]   │ [Submit Test]    │
└──────────────────────────────────┴──────────────────┘
```

---

# 15. Mobile Test Experience

The platform must be fully responsive.

On smaller screens:

- Question content occupies the main view.
- Question palette opens in a drawer/sheet.
- Timer remains clearly visible.
- Navigation buttons remain accessible.
- Answer choices have large touch targets.
- Test submission requires confirmation.

No essential feature should depend on hover behavior.

---

# 16. Question States

Each question in an active test may have a state such as:

- Not visited.
- Visited.
- Answered.
- Unanswered.
- Marked for review.
- Answered and marked for review.

The interface should visually distinguish these states.

---

# 17. Autosaving

Answers must be autosaved.

When a student selects an option:

1. Update local UI immediately.
2. Save answer to the backend.
3. Confirm successful persistence.
4. Retry safely if a temporary network failure occurs.
5. Prevent duplicate answer records.

Navigation must not require waiting for a full page refresh.

The student should not lose answers because they refresh the browser.

---

# 18. Timer Requirements

The timer must not rely solely on client-side countdown state.

The authoritative calculation will be based on:

- `started_at`
- Test duration
- Server time

Conceptually:

```text
expires_at = started_at + test_duration
```

The client displays:

```text
remaining_time = expires_at - current_time
```

Refreshing the page should reconstruct the timer from the server-provided expiry.

When the attempt expires:

- Additional answers should not be accepted.
- The test should automatically submit where possible.
- Server-side validation must enforce expiration.

Manipulating the browser clock must not extend test duration.

---

# 19. Question Formats

MVP:

- Single-choice MCQ.

Architecture should support future types:

- Multiple-response MCQ.
- True/false.
- Numerical answer.
- Fill-in-the-blank.

Each question should contain:

- Question text.
- Question type.
- Subject/topic.
- Difficulty.
- Marks.
- Negative marks.
- Explanation.
- Status.
- Creator.
- Created/updated timestamps.

---

# 20. Question Options

Question options should be stored separately rather than hard-coding A/B/C/D fields.

Each option contains:

- ID.
- Question ID.
- Option content.
- Correct/incorrect indicator.
- Display order.

This allows questions to contain different numbers of options in the future.

---

# 21. Test Submission

A user may submit:

- Manually.
- Automatically when time expires.

Before manual submission, the UI should display a confirmation dialog showing:

- Answered count.
- Unanswered count.
- Marked-for-review count.

Submission must be idempotent so duplicate requests return the already stored result.

---

# 22. Secure Scoring

Official scores must be calculated on the server.

The client must not determine authoritative correctness.

Before submission, students must not receive privileged fields such as:

- Correct answer.
- `is_correct`.
- Solution.
- Answer explanation when restricted until completion.

The server should calculate:

- Correct answers.
- Incorrect answers.
- Unanswered questions.
- Positive marks.
- Negative marks.
- Final score.
- Percentage.
- Time taken.

---

# 23. Results Page

After submission, students should see:

- Score.
- Maximum score.
- Percentage.
- Correct answers.
- Incorrect answers.
- Unanswered questions.
- Accuracy.
- Time taken.
- Average time per question.
- Subject breakdown.
- Topic breakdown.
- Difficulty breakdown where useful.

---

# 24. Answer Review

Students should be able to review their completed test.

For each question:

- Question text.
- Their selected answer.
- Correct answer.
- Correct/incorrect status.
- Explanation.
- Marks gained/lost.

Filters:

- All.
- Correct.
- Incorrect.
- Unanswered.
- Marked for review.

---

# 25. Admin Dashboard

The administrative dashboard should provide quick visibility into:

- Total users.
- Active users.
- Published tests.
- Draft tests.
- Total questions.
- Test attempts.
- Recent activity.
- Average completion rate.

---

# 26. Admin Content Management

Administrators/editors should be able to manage:

- Exams.
- Subjects.
- Topics.
- Question bank.
- Question options.
- Mock tests.
- Test questions.
- Test publishing.
- Bulk question imports.

Deleting entities that already have dependent data should be restricted or handled through archival.

---

# 27. Question Bank

The question bank is a major administrative feature.

Administrators/editors should be able to:

- Create questions.
- Edit questions.
- Duplicate questions.
- Archive questions.
- Search questions.
- Filter questions.
- Preview questions.
- View usage in tests.

Filters should include:

- Exam.
- Subject.
- Topic.
- Difficulty.
- Question type.
- Status.
- Created by.

---

# 28. Bulk Question Import

Bulk import should be added relatively early.

Potential formats:

- CSV.
- XLSX.

Import workflow:

1. Upload file.
2. Parse contents.
3. Validate rows.
4. Show errors.
5. Preview valid questions.
6. Confirm import.
7. Store questions.

The import should never silently skip malformed rows.

---

# 29. Test Builder

Administrators should be able to build tests from the question bank.

Functions:

- Add test metadata.
- Select exam.
- Set duration.
- Set instructions.
- Search question bank.
- Filter questions.
- Add/remove questions.
- Reorder questions.
- Override marks.
- Configure negative marking.
- Preview test.
- Save draft.
- Publish test.

---

# 30. Performance Analytics

Students should eventually receive analytics at several levels:

- Overall accuracy.
- Average score.
- Number of attempts.
- Questions attempted.
- Improvement over time.
- Subject accuracy.
- Topic accuracy.
- Difficulty accuracy.

Weak-topic detection should require enough attempted questions before labeling a topic as weak.

---

# 31. Retaking Tests

Tests may optionally allow multiple attempts.

Configurable behavior may include:

- Unlimited attempts.
- Maximum attempt count.
- One attempt only.
- Best score shown.
- Latest score shown.
- Attempt history retained.

---

# 32. MVP Acceptance Criteria

The MVP is acceptable when:

- A student can register and log in.
- A student can browse at least one exam and published test.
- A student can start a timed MCQ attempt.
- Answers autosave reliably.
- The timer is reconstructed from server-side attempt data.
- The student can submit the test.
- Score is calculated on the server.
- Result summary is displayed.
- Answer review is available after submission.
- Admin can create exams, subjects, topics, questions, and tests.
- Admin can publish/unpublish tests.
- Correct answers are not exposed during active attempts.
- RLS prevents users from accessing other users' private data.

---

# 33. MVP Build Phases

## Phase 1: Foundation

- Next.js app.
- Tailwind CSS.
- Supabase connection.
- Authentication.
- Profiles and roles.

## Phase 2: Content Model

- Exams.
- Subjects.
- Topics.
- Questions.
- Options.

## Phase 3: Test Builder

- Tests.
- Test questions.
- Duration.
- Marks.
- Publish/unpublish.

## Phase 4: Test Taking

- Test instructions.
- Active test UI.
- Timer.
- Autosave.
- Submit.

## Phase 5: Results

- Server-side scoring.
- Result summary.
- Answer review.
- Attempt history.

## Phase 6: Dashboard and Admin Polish

- Student dashboard.
- Bookmarks.
- Basic analytics.
- Bulk import.
- Admin reporting.

---

# 34. Summary

The product should first become a dependable online MCQ mock-test platform. The highest-risk areas are test timing, autosave, secure scoring, authorization, and answer protection. Once the core student test flow is reliable, the product can expand into analytics, premium content, mobile/PWA support, leaderboards, and advanced learning features.
