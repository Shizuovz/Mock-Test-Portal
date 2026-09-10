# Revised Implementation Plan — Mock Test Portal V1

## Authentication, Free Tests, Paid Access, Payments, Analytics & Admin

### Project Goal

Build a commercially viable V1 of the NSSB Mock Test Portal that allows prospective candidates to:

- Browse available mock tests without registering.
- Register for a free account using name, email, phone number and password.
- Receive access to 3 predefined free mock tests.
- View test results and basic performance information.
- Upgrade to a paid access plan.
- Pay securely through Razorpay.
- Receive paid access only after verified payment confirmation.
- Access additional tests and analytics according to their plan.
- Track their previous attempts and progress.

Administrators should be able to:

- See total registered users.
- Track new registrations.
- Search and filter users.
- See test activity.
- See paid users.
- Track purchases and revenue.
- Track conversion from free users to paying users.
- Inspect an individual user's account/activity.
- Manage plans and eventually control which tests are free or paid.

---

# 1. V1 Product Decisions

The following assumptions will be used for implementation unless intentionally changed before development begins.

## 1.1 Free Account

Registration is free.

Every registered user receives access to **3 predefined free mock tests**.

Do not implement generic `free_test_credits = 3` in V1.

Instead, individual tests will have an access classification such as:

```text
Free
Starter
Pro
Complete
```

or, initially:

```text
is_free = true / false
```

Recommended free test structure:

```text
Free Mock Test 1 — Diagnostic Test
Free Mock Test 2 — Full NSSB Mock
Free Mock Test 3 — Full NSSB Mock
```

The purpose of the free tests is to demonstrate the quality and usefulness of the portal before asking the user to pay.

---

# 2. Proposed V1 Pricing

Use **one-time access passes** rather than automatically renewing subscriptions.

## Free

Price:

```text
₹0
```

Access:

```text
3 predefined NSSB mock tests
Basic score report
Attempt history
Basic performance tracking
```

---

## Starter

Price:

```text
₹199
```

Duration:

```text
30 days
```

Suggested benefits:

```text
15 full-length NSSB mock tests
Detailed answers and explanations
Subject-wise performance
Score history
2 attempts per test
```

---

## Pro

Price:

```text
₹399
```

Duration:

```text
90 days
```

Suggested benefits:

```text
Access to all NSSB mock tests
Interactive Previous Year Questions
Sectional tests
Detailed explanations
Topic-wise analytics
Subject-wise analytics
Rank / percentile
Unlimited reattempts
New tests added during plan validity
Progress tracking
Weak-area identification
```

This should be displayed as:

```text
MOST POPULAR
```

---

## Complete

Price:

```text
₹699
```

Duration:

```text
180 days
```

Suggested benefits:

```text
Everything included in Pro
Access to all supported NSSB exam series
All new tests during access period
Advanced performance analysis
Personalized weak-topic recommendations
Extended progress history
Exam readiness insights
```

Do not include human mentorship in V1.

Mentorship can later become a separate product.

---

# 3. Important Terminology

Although the UI may use terms such as:

```text
Plan
Premium Plan
Upgrade
Membership
```

internally the application should treat these purchases as:

```text
Access Passes
```

rather than recurring subscriptions.

Therefore the database should prefer:

```text
plans
purchases
```

instead of:

```text
subscriptions
```

This prevents future confusion between one-time access purchases and genuinely recurring subscriptions.

---

# 4. High-Level User Journey

The expected funnel should be:

```text
Visitor
   ↓
Browse Mock Tests
   ↓
Click "Start Free Mock Test"
   ↓
Registration
   ↓
Email Verification
   ↓
Free Account
   ↓
Take Free Test
   ↓
View Results
   ↓
Take Additional Free Tests
   ↓
Encounter Paid Test / Upgrade CTA
   ↓
View Pricing
   ↓
Choose Plan
   ↓
Razorpay Checkout
   ↓
Verified Payment
   ↓
Paid Access Granted
   ↓
Additional Tests + Analytics
```

This funnel should eventually be measurable from the admin dashboard.

---

# 5. Public Website Experience

Anonymous visitors should NOT immediately be forced to register simply because they visit the site.

They should be allowed to browse:

- Home page.
- Mock test catalogue.
- Exam categories.
- Test titles.
- Number of questions.
- Duration.
- Subjects covered.
- Free/Premium indicator.
- Pricing page.
- Sample result/analytics screenshots where appropriate.
- Frequently asked questions.

Registration becomes mandatory only when the user wants to:

```text
Start a test
Save progress
View personal results
Purchase a plan
```

---

# 6. Mock Test Catalogue Behaviour

Each mock test card should show information such as:

```text
Test Name
Exam
Number of Questions
Duration
Total Marks
Difficulty
Free / Premium
Attempts allowed
```

Example:

```text
NSSB CET Mock Test 01

100 Questions
120 Minutes
100 Marks

FREE

[Start Test]
```

Paid example:

```text
NSSB CET Mock Test 07

100 Questions
120 Minutes
100 Marks

PRO

[Unlock Test]
```

---

# 7. Guest Access Behaviour

If an unauthenticated visitor clicks:

```text
Start Test
```

on a free test, show a signup prompt.

Recommended message:

```text
Create your free account

Get 3 NSSB Mock Tests FREE and start tracking your preparation.

✓ Instant scores
✓ Performance tracking
✓ Identify weak subjects
✓ No payment required

[Create Free Account]

Already registered? Sign in
```

After signup/login, return the user to the test they originally selected.

Do not simply redirect them to the dashboard and make them locate the test again.

Store something such as:

```text
returnUrl=/tests/{testId}
```

during the authentication flow.

---

# 8. Authentication

Use Supabase Auth.

## Signup fields

Required:

```text
Full Name
Email Address
Phone Number
Password
Confirm Password
```

Optional later:

```text
District
Target exam
Notification preferences
```

Do not collect unnecessary profile data during V1 signup.

The shorter the form, the better the conversion rate.

---

# 9. Email Verification

Enable email verification for new accounts.

Flow:

```text
Signup
   ↓
Supabase creates auth account
   ↓
Verification email sent
   ↓
User verifies email
   ↓
Account becomes fully active
```

If email verification is required before starting a mock test, clearly communicate this.

Example:

```text
We've sent a verification link to your email.

Verify your email to start your free mock tests.
```

---

# 10. Phone Number

Phone number should be required during registration because it is important to the business.

For V1:

```text
Collect phone number
Do NOT require phone OTP
```

Database fields:

```text
phone_number
phone_verified_at
```

Initially:

```text
phone_verified_at = NULL
```

This allows phone verification to be added later without redesigning the database.

---

# 11. Phone Number Validation

Apply reasonable validation.

For an India-focused product:

Accept formats such as:

```text
9876543210
+919876543210
```

Normalize before saving.

Recommended internal format:

```text
+919876543210
```

Avoid storing different formats for different users.

---

# 12. Marketing Consent

Account creation and marketing permission should be separate.

Signup could contain an optional checkbox:

```text
☐ Send me exam updates, new mock tests and offers via WhatsApp/SMS.
```

Store something like:

```text
marketing_consent
marketing_consent_at
```

Do not automatically treat account registration as unlimited promotional consent.

---

# 13. User Profiles

Do not rely on Supabase `user_metadata` as the permanent source of user information.

Use Supabase Auth for identity.

Use a public/application `profiles` table for application profile data.

Relationship:

```text
auth.users
    │
    └── profiles
```

---

# 14. Proposed `profiles` Table

Create migration:

```text
supabase/migrations/0004_profiles_commercial_fields.sql
```

Suggested schema:

```sql
profiles

id uuid primary key
full_name text not null
phone_number text
phone_verified_at timestamptz null

marketing_consent boolean default false
marketing_consent_at timestamptz null

signup_source text null
utm_source text null
utm_medium text null
utm_campaign text null

created_at timestamptz
updated_at timestamptz
```

`id` should reference:

```text
auth.users.id
```

---

# 15. Creating the Profile

During signup, pass temporary metadata:

```typescript
options: {
  data: {
    full_name,
    phone_number
  }
}
```

Then create the corresponding row in `profiles`.

This may be implemented through:

```text
Supabase database trigger
```

or a controlled server-side signup/profile initialization process.

If using a trigger, test failure scenarios carefully because profile creation should never unintentionally break registration.

---

# 16. Plans Table

Create:

```text
supabase/migrations/0005_plans.sql
```

Suggested schema:

```sql
plans

id uuid primary key
code text unique not null
name text not null

price_paise integer not null
duration_days integer not null

description text
is_active boolean default true

created_at timestamptz
updated_at timestamptz
```

Seed data:

```text
starter
Starter
19900
30
```

```text
pro
Pro
39900
90
```

```text
complete
Complete
69900
180
```

Important:

Store prices in paise.

Example:

```text
₹199 = 19,900 paise
₹399 = 39,900 paise
₹699 = 69,900 paise
```

Never store monetary amounts as floating-point numbers.

---

# 17. Do Not Hardcode Pricing in React

Avoid:

```typescript
const price = 199;
```

on the pricing page.

The pricing UI should retrieve plans from the database or a secure server-side configuration.

Benefits:

- Prices can change without modifying several pages.
- Expired plans can be disabled.
- Admin plan management can be added later.
- Purchase records retain the actual amount paid.

---

# 18. Purchases Table

Create:

```text
supabase/migrations/0006_purchases.sql
```

Suggested schema:

```sql
purchases

id uuid primary key

user_id uuid not null
plan_id uuid not null

amount_paid_paise integer not null
currency text default 'INR'

payment_gateway text
gateway_order_id text
gateway_payment_id text

status text not null

access_starts_at timestamptz
access_expires_at timestamptz

created_at timestamptz
updated_at timestamptz
```

Allowed status values:

```text
pending
paid
failed
refunded
cancelled
```

---

# 19. Preserve Purchase Price

Do not calculate old purchases using the current `plans.price`.

Example:

A user purchased Pro for:

```text
₹399
```

You later change Pro to:

```text
₹449
```

Their historical record must still say:

```text
₹399 paid
```

Therefore:

```text
amount_paid_paise
```

must be copied into the purchase record at checkout time.

---

# 20. Payment Events Table

Create:

```text
supabase/migrations/0007_payment_events.sql
```

Suggested schema:

```sql
payment_events

id uuid primary key
gateway text not null
gateway_event_id text unique not null
event_type text not null

payload jsonb

processed_at timestamptz
created_at timestamptz
```

Purpose:

- Keep payment webhook history.
- Prevent duplicate processing.
- Assist debugging.
- Support refunds later.
- Provide an audit trail.

---

# 21. Razorpay Integration

Use Razorpay for V1.

Payment flow:

```text
User chooses plan
       ↓
Server creates pending purchase
       ↓
Server creates Razorpay order
       ↓
Razorpay Checkout opens
       ↓
User completes payment
       ↓
Frontend displays processing/success state
       ↓
Razorpay webhook reaches server
       ↓
Webhook signature verified
       ↓
Payment event processed
       ↓
Purchase becomes PAID
       ↓
Access start/end dates created
       ↓
User gains paid access
```

---

# 22. Payment Security Rule

The frontend must NEVER be allowed to grant paid access.

Do not implement:

```text
Checkout says success
↓
set user.plan = Pro
```

Paid access must only become active after trusted server-side verification.

The webhook should be the authoritative payment confirmation.

---

# 23. Razorpay API Endpoints

Suggested routes:

```text
POST /api/payments/create-order
```

Responsibilities:

```text
Validate authenticated user
Validate selected plan
Create pending purchase
Create Razorpay order
Return checkout information
```

---

```text
POST /api/webhooks/razorpay
```

Responsibilities:

```text
Read raw webhook payload
Verify Razorpay signature
Check gateway_event_id
Reject/ignore duplicates
Determine payment event type
Find purchase
Update purchase
Set access dates
Record payment event
Return success response
```

---

# 24. Webhook Idempotency

Webhook processing MUST be idempotent.

Example:

Razorpay sends:

```text
payment.captured
```

three times.

The application should still create only:

```text
one completed purchase
one access period
```

Use:

```text
gateway_event_id UNIQUE
```

to assist with this.

---

# 25. Access Dates

When payment is successfully confirmed:

Starter:

```text
access_starts_at = payment confirmation time
access_expires_at = +30 days
```

Pro:

```text
+90 days
```

Complete:

```text
+180 days
```

---

# 26. Determining Current Access

Do not store:

```text
profiles.current_plan = 'pro'
```

as the authoritative source.

Instead determine whether an active purchase exists:

```text
status = paid

AND

access_starts_at <= NOW()

AND

access_expires_at > NOW()
```

A helper/service should determine:

```text
getCurrentUserAccess(userId)
```

Example output:

```typescript
{
  plan: "pro",
  active: true,
  startedAt: "...",
  expiresAt: "...",
  daysRemaining: 54
}
```

---

# 27. Test Access Model

Tests need an access classification.

For the first implementation, consider:

```sql
tests

is_free boolean default false
required_plan text nullable
```

Possible values:

```text
free
starter
pro
complete
```

A more scalable implementation could later introduce:

```text
test_access_rules
```

but this is not required for V1.

---

# 28. Access Hierarchy

Recommended hierarchy:

```text
FREE < STARTER < PRO < COMPLETE
```

Meaning:

Starter can access:

```text
Free
Starter
```

Pro can access:

```text
Free
Starter
Pro
```

Complete can access:

```text
Free
Starter
Pro
Complete
```

Represent plan level internally with an integer if useful:

```text
free = 0
starter = 1
pro = 2
complete = 3
```

Avoid scattering string comparisons throughout the application.

---

# 29. Central Authorization Function

Create one central function/service:

```text
canUserAccessTest(userId, testId)
```

The logic should determine:

```text
Is test free?
```

If yes:

```text
Authenticated registered user → allowed
```

Otherwise:

```text
Does user have an active paid access pass?
```

Then:

```text
Does their plan meet the required access level?
```

Return something like:

```typescript
{
  allowed: true
}
```

or:

```typescript
{
  allowed: false,
  reason: "PLAN_REQUIRED",
  requiredPlan: "pro"
}
```

---

# 30. Server-Side Enforcement

React/UI restrictions are not sufficient.

Every sensitive operation must also check permissions server-side.

Especially:

```text
Start test
Load protected questions
Submit attempt
View protected solutions
Access premium analytics
```

A user should not be able to manually enter a URL or call an API to bypass payment.

---

# 31. Row Level Security

RLS must be explicitly implemented.

Do not leave it until the end.

---

# 32. Profiles RLS

Users should be able to:

```text
SELECT their own profile
UPDATE approved fields in their own profile
```

Users should NOT be able to:

```text
Read every user's phone number
Change administrative fields
Change access/payment fields
```

---

# 33. Purchase RLS

Users may:

```text
Read their own purchase history
```

Users must NOT be able to:

```text
Mark a purchase as paid
Change price
Extend access
Change gateway payment IDs
```

Those operations should only occur through trusted server-side code.

---

# 34. Attempts RLS

Users may:

```text
Read their own attempts
```

They must not be able to access:

```text
another user's attempts
another user's answers
another user's analytics
```

---

# 35. Admin Security

Do not implement admin access using something like:

```text
if (user.email === "admin@email.com")
```

Create proper admin authorization.

Possible approaches:

```text
roles table
```

or:

```text
profiles.role
```

Values:

```text
student
admin
```

For larger systems later:

```text
student
content_manager
support
admin
super_admin
```

For V1:

```text
student
admin
```

is sufficient.

---

# 36. Admin Route Protection

All:

```text
/admin/*
```

routes must validate the server-side admin role.

Do not rely solely on hiding the Admin navigation link.

An authenticated student manually entering:

```text
/admin/users
```

must receive:

```text
403
```

or be redirected.

---

# 37. Test Attempt Model

Existing test attempt logic should be reviewed.

Recommended fields:

```sql
attempts

id uuid
user_id uuid
test_id uuid

attempt_number integer

status text

started_at timestamptz
submitted_at timestamptz

score numeric
correct_count integer
incorrect_count integer
unattempted_count integer

time_taken_seconds integer

created_at timestamptz
```

Possible statuses:

```text
in_progress
submitted
auto_submitted
abandoned
```

---

# 38. Reattempt Rules

Suggested:

Free:

```text
1 scored attempt per free test
```

Starter:

```text
2 attempts per test
```

Pro:

```text
Unlimited
```

Complete:

```text
Unlimited
```

If implementing attempt limits adds too much V1 complexity, simplify:

```text
Free = 1 attempt
All paid plans = unlimited attempts
```

---

# 39. Never Overwrite Attempts

Every attempt must remain separate.

Example:

```text
Mock Test 05

Attempt 1 — 71
Attempt 2 — 82
Attempt 3 — 87
```

This enables progress analysis later.

---

# 40. Results — Free Tier

Basic free report:

```text
Score
Percentage
Correct answers
Incorrect answers
Unattempted questions
Time taken
```

Also show a conversion CTA.

Example:

```text
You scored 62%.

Want to see which subjects are holding you back?

Unlock detailed analysis with Starter from ₹199.

[View Plans]
```

---

# 41. Results — Starter

Starter can add:

```text
Subject-wise scores
Subject accuracy
Average time per question
Strongest subject
Weakest subject
Score history
Detailed explanations
```

---

# 42. Results — Pro

Pro adds:

```text
Topic-wise performance
Historical trend
Weak-topic identification
Rank
Percentile
Detailed time analysis
Difficulty-level performance
Unlimited reattempt comparisons
```

---

# 43. Results — Complete

Complete may additionally include:

```text
Cross-exam analytics
Exam readiness score
Personalized recommendations
Long-term progress analysis
```

Do not overbuild these features before enough user/test data exists.

---

# 44. Pricing Page

Create:

```text
src/app/(public)/pricing/page.tsx
```

Page should contain:

```text
Free
Starter
Pro
Complete
```

Use a comparison layout.

Highlight:

```text
PRO
MOST POPULAR
```

Each paid plan should show:

```text
Price
Duration
Key features
Access expiry
One-time payment wording
CTA
```

Example:

```text
₹399
90 Days Access

One-time payment.
No automatic renewal.

[Get Pro]
```

This wording is important.

---

# 45. Pricing CTA Behaviour

Unauthenticated user:

```text
Select plan
↓
Signup/Login
↓
Return to selected plan
↓
Checkout
```

Authenticated free user:

```text
Select plan
↓
Checkout
```

Active paid user:

Show context.

Example:

```text
You currently have Pro access until 16 Dec 2026.
```

Upgrade/extension logic can initially be simple.

---

# 46. Multiple Purchases / Renewals

Define V1 behaviour now.

Recommended:

If a user's existing plan is active and they buy another pass:

```text
New access begins when current access expires
```

Example:

Current Pro:

```text
expires 1 December
```

User buys another 90-day Pro pass on 20 November.

New expiry:

```text
1 March approximately
```

Do not throw away unused paid access.

If cross-plan upgrades become complicated, defer true upgrades until V1.1.

V1 may simply extend access based on the new purchase.

---

# 47. User Dashboard

Registered user dashboard should contain:

## Welcome section

```text
Welcome, John
```

## Current access

Free:

```text
Free Plan
2 of 3 free mock tests completed

[Upgrade]
```

Paid:

```text
Pro Access

Valid until:
16 December 2026

45 days remaining
```

---

# 48. Dashboard Metrics

Suggested cards:

```text
Tests Completed
Average Score
Best Score
Recent Test
```

Paid plans may additionally display:

```text
Percentile
Strongest Subject
Weakest Subject
Improvement
```

---

# 49. Dashboard Test Section

Display:

```text
Continue Test
Available Tests
Completed Tests
Recommended Tests
```

After all free tests are completed, prominently show:

```text
You've completed your free mock tests.

Unlock the full NSSB test series from ₹199.

[View Plans]
```

---

# 50. Purchase History

Add account page:

```text
/account/billing
```

Display:

```text
Plan
Payment date
Amount
Status
Access dates
Payment reference
```

Example:

```text
Pro
₹399
Paid
02 Sep 2026
Valid until 01 Dec 2026
```

---

# 51. Admin Dashboard Overview

Update:

```text
src/app/admin/page.tsx
```

Recommended top-level KPI cards:

```text
Total Registered Users
New Users Today
New Users This Week
Active Paid Users
Total Purchases
Revenue
Free → Paid Conversion
Tests Completed
```

---

# 52. Admin User Management

Create:

```text
src/app/admin/users/page.tsx
```

Columns:

```text
Name
Phone
Email
Joined
Tests Completed
Last Active
Plan
Expires
Total Paid
```

Avoid displaying too many additional columns.

---

# 53. User Search

Search should support:

```text
Name
Email
Phone number
```

---

# 54. User Filters

Recommended V1 filters:

```text
Registration date

Free
Starter
Pro
Complete

Paid
Never Paid

Active
Expired

Completed test
Never started test
```

---

# 55. Admin User Detail Page

Create:

```text
src/app/admin/users/[id]/page.tsx
```

Sections:

## Profile

```text
Name
Email
Phone
Phone verification
Joined
Marketing consent
Signup source
```

## Activity

```text
Tests started
Tests completed
Average score
Last active
```

## Access

```text
Current plan
Start date
Expiry
Status
```

## Purchases

```text
Plan
Amount
Gateway ID
Payment date
Status
Access period
```

## Test history

```text
Test
Attempt number
Score
Date
Time
```

---

# 56. Admin Registration Analytics

Track:

```text
Total registrations
Today
Last 7 days
Last 30 days
```

Add trend charts later if desired.

For V1, summary cards and tables are sufficient.

---

# 57. Admin Activation Metrics

Track:

```text
Users who registered
Users who started at least one test
Users who completed at least one test
Users who completed all free tests
```

This provides an activation funnel.

---

# 58. Revenue Metrics

Track:

```text
Paid users
Total successful purchases
Revenue today
Revenue this month
Total revenue
```

Break down:

```text
Starter purchases
Pro purchases
Complete purchases
```

---

# 59. Conversion Metrics

This is a key business feature.

Calculate:

```text
Signup → First Test
```

```text
Signup → Free Tests Completed
```

```text
Signup → Paid
```

```text
Completed Free Tests → Paid
```

Example:

```text
1,000 signups
720 started a mock test
480 completed all free tests
91 purchased

Signup → Paid = 9.1%
Free completion → Paid = 19%
```

---

# 60. Marketing Attribution

Capture UTM parameters during signup.

Fields:

```text
utm_source
utm_medium
utm_campaign
```

Examples:

```text
facebook
instagram
google
whatsapp
telegram
```

Store the first meaningful acquisition source against the profile.

Later the admin panel can show:

```text
Instagram
220 registrations
24 paid
```

```text
Google
80 registrations
18 paid
```

This does not need a sophisticated analytics platform for V1.

---

# 61. Signup Source

Also capture:

```text
signup_source
```

Possible values:

```text
home
test
pricing
referral
campaign
```

This helps answer:

```text
Where were users when they decided to register?
```

---

# 62. Admin Navigation

Modify:

```text
src/components/admin/admin-sidebar.tsx
```

Recommended sections:

```text
Dashboard
Users
Tests
Attempts
Purchases
Plans
Analytics
```

If `Plans` management is not required immediately, it can initially be read-only.

---

# 63. Admin Purchases Page

Create:

```text
src/app/admin/purchases/page.tsx
```

Columns:

```text
User
Plan
Amount
Status
Date
Gateway
Payment ID
Access Expiry
```

Filters:

```text
Paid
Pending
Failed
Refunded

Starter
Pro
Complete

Date range
```

Search:

```text
Email
Phone
Gateway payment ID
```

---

# 64. Admin Plan Page

Optional for late V1:

```text
src/app/admin/plans/page.tsx
```

Initially allow administrators to view:

```text
Plan
Price
Duration
Active
```

Avoid building full pricing-edit functionality until needed.

Database-based plans already make later editing possible.

---

# 65. Free Test Administration

Add fields to tests that allow an administrator to identify free tests.

At minimum:

```text
is_free
```

Later:

```text
required_plan
```

Admin Tests page should indicate:

```text
FREE
STARTER
PRO
COMPLETE
```

---

# 66. Audit / Administrative Changes

Avoid silently changing important user access data.

For later V1/V1.1, consider:

```text
admin_audit_logs
```

for actions such as:

```text
Manual access granted
Access extended
Refund processed
Role changed
```

This is especially useful when multiple administrators are added.

---

# 67. Error Handling

Plan for payment failures explicitly.

## Payment cancelled

Show:

```text
Payment cancelled.

No amount has been charged.

[Try Again]
```

## Payment failed

Show:

```text
We couldn't complete your payment.

Your account has not been charged for access.

[Retry Payment]
```

## Payment successful but webhook delayed

Show:

```text
Payment received.

We're confirming your payment.

Refresh your account shortly if access does not appear automatically.
```

Do not grant access merely to avoid this temporary state.

---

# 68. Expired Plan Experience

When access expires:

Do NOT delete:

```text
Account
Test attempts
Scores
Purchase history
```

User retains historical data.

Paid tests become locked.

Show:

```text
Your Pro access expired on 1 December 2026.

Renew your access to continue taking premium mock tests.

[Renew Access]
```

---

# 69. Existing Attempt When Plan Expires

Define this edge case.

Recommended rule:

If a user legitimately starts a test while their plan is active:

```text
allow that attempt to be submitted
```

even if the plan expires while the test is underway.

Store access authorization when the attempt begins.

Avoid abruptly terminating an examination because access expired during the timer.

---

# 70. Free User Upgrade Prompts

Upgrade prompts should appear naturally, not constantly.

Recommended locations:

```text
After submitting free mock test
When opening locked test
Dashboard after free tests
Pricing CTA
Analytics teaser
```

Avoid disruptive modal spam.

---

# 71. Analytics Teaser

A useful conversion technique:

Free user sees:

```text
Subject Performance

General Knowledge    72%
English              🔒
Reasoning             🔒
Quantitative Aptitude 🔒

Unlock detailed performance analysis
```

Do not fabricate analytics.

Only hide information that has actually been calculated.

---

# 72. Database Migration Sequence

Suggested migration structure:

```text
0004_profiles_commercial_fields.sql

0005_plans.sql

0006_purchases.sql

0007_payment_events.sql

0008_test_access_fields.sql

0009_attempt_enhancements.sql

0010_admin_roles.sql

0011_rls_policies.sql

0012_analytics_indexes.sql
```

Exact numbering can be adjusted to match the existing project.

---

# 73. Recommended Database Indexes

Add indexes where reporting/access queries will be common.

Examples:

```text
profiles.created_at

profiles.phone_number

purchases.user_id

purchases.status

purchases.access_expires_at

purchases.gateway_payment_id

attempts.user_id

attempts.test_id

attempts.submitted_at
```

Do not add unnecessary indexes to every field.

---

# 74. Environment Variables

Required server-side configuration may include:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

Important:

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

to browser JavaScript.

---

# 75. Logging

Implement structured logging around:

```text
Signup errors
Profile initialization
Payment order creation
Webhook processing
Failed payment verification
Access checks
Admin errors
```

Never log:

```text
Passwords
Full payment secrets
Authentication tokens
Sensitive card information
```

---

# 76. Testing Strategy

The current verification approach should be expanded considerably.

Tests should cover:

```text
Authentication
Authorization
Free access
Paid access
Payment verification
Expiry
Admin permissions
RLS
Attempt limits
Duplicate webhooks
```

---

# 77. Authentication Tests

Test:

```text
User can register
```

```text
Name saved
```

```text
Phone normalized and saved
```

```text
Email verification flow works
```

```text
Existing email cannot register twice
```

```text
Invalid phone rejected
```

```text
Incorrect password login rejected
```

```text
Forgot-password flow works
```

---

# 78. Guest Access Tests

Test:

```text
Guest can view test catalogue
```

```text
Guest can view pricing
```

```text
Guest cannot start test
```

```text
Guest selecting test is taken to signup
```

```text
After signup/login user returns to selected test
```

---

# 79. Free Access Tests

Test:

```text
Registered free user can access designated free tests
```

```text
Free user cannot access paid test
```

```text
Free user cannot bypass lock by directly calling protected API
```

```text
Free user cannot access premium solutions
```

---

# 80. Paid Access Tests

Test:

```text
Starter can access Starter tests
```

```text
Starter cannot access Pro-only test
```

```text
Pro can access Starter + Pro
```

```text
Complete can access all tiers
```

---

# 81. Payment Tests

Test:

```text
Pending payment → no access
```

```text
Failed payment → no access
```

```text
Cancelled payment → no access
```

```text
Successful verified payment → access granted
```

```text
Invalid webhook signature → rejected
```

```text
Duplicate webhook → no duplicate purchase/access
```

```text
Unknown Razorpay order → safely rejected/logged
```

---

# 82. Expiry Tests

Test:

```text
Active paid plan → access
```

```text
Expired paid plan → no new paid test access
```

```text
Expired user retains results/history
```

```text
Attempt started before expiry may be submitted
```

---

# 83. RLS / Security Tests

Critical tests:

```text
User A cannot read User B profile
```

```text
User A cannot read User B attempts
```

```text
User A cannot read User B purchases
```

```text
User cannot set purchase status to paid
```

```text
User cannot extend access date
```

```text
Student cannot access admin routes
```

```text
Admin can access admin routes
```

---

# 84. Admin Tests

Verify:

```text
New registration appears
```

```text
Phone displayed
```

```text
Plan displayed
```

```text
Test count correct
```

```text
Purchase history correct
```

```text
Revenue calculations use successful payments only
```

```text
Failed payments excluded from revenue
```

```text
Search by email works
```

```text
Search by phone works
```

```text
Plan filters work
```

---

# 85. E2E Test Scenarios

Use Playwright for major journeys.

## E2E 1 — Free user

```text
Visit site
→ Browse tests
→ Start free test
→ Register
→ Verify/authenticate
→ Start free test
→ Submit
→ View result
```

---

## E2E 2 — Free user blocked from Premium

```text
Login as free user
→ Open premium test
→ See upgrade message
→ Open pricing
```

---

## E2E 3 — Paid user

Using test payment environment:

```text
Login
→ Choose Pro
→ Complete payment
→ Webhook processed
→ Pro becomes active
→ Premium test accessible
```

---

## E2E 4 — Expired user

```text
Login as expired Pro
→ Dashboard shows expired
→ Premium test locked
→ Historical attempts still visible
→ Renewal CTA displayed
```

---

# 86. V1 Implementation Phases

Development should be incremental.

Do not attempt every commercial feature in one branch.

---

# Phase 1 — Authentication & Profile Foundation

Implement:

```text
Signup
Login
Logout
Forgot password
Email verification
Name
Phone
Phone normalization
Marketing consent
Profiles
Admin role
RLS foundation
```

Deliverable:

A secure registered account system.

---

# Phase 2 — Free Mock Test Funnel

Implement:

```text
3 designated free tests
Guest test prompt
Auth return URL
Free test access
Free result report
Attempt history
Locked paid tests
Upgrade CTAs
```

Deliverable:

A complete free-user journey.

At this stage, the portal could already begin collecting real registrations.

---

# Phase 3 — Plan & Access Infrastructure

Implement:

```text
Plans table
Plan hierarchy
Purchases table
Access calculation
Test access levels
canUserAccessTest()
Server-side authorization
Expiry handling
```

Deliverable:

Paid access rules work even before the real payment gateway is connected.

Use development/test purchases for verification.

---

# Phase 4 — Razorpay

Implement:

```text
Create-order API
Checkout
Pending purchases
Webhook endpoint
Webhook verification
Payment event storage
Successful access activation
Failed payments
Duplicate webhook handling
```

Deliverable:

Users can pay and automatically receive verified access.

---

# Phase 5 — Pricing & User Billing UX

Implement:

```text
Pricing page
Plan comparison
Most Popular highlight
Purchase history
Current plan
Expiry display
Renew CTA
Payment failure/success pages
```

Deliverable:

Complete customer purchase experience.

---

# Phase 6 — Admin User Management

Implement:

```text
Admin dashboard
Users page
User search
Filters
User detail page
Current plan
Attempts
Purchase history
```

Deliverable:

Administrator can manage and understand the user base.

---

# Phase 7 — Business Analytics

Implement:

```text
Registrations
Activation
Test completion
Paid users
Revenue
Free → Paid conversion
Plan breakdown
Signup attribution
```

Deliverable:

Admin can understand whether the business funnel is working.

---

# Phase 8 — Hardening & Launch

Before launch:

```text
Run E2E suite
Security testing
RLS verification
Payment testing
Mobile testing
Expired access testing
Webhook retry testing
Database backup review
Error logging review
Privacy/Terms pages
Production environment variables
Razorpay production configuration
```

---

# 87. Explicitly Out of Scope for V1

Do NOT add these until the core funnel works:

```text
Phone OTP
Recurring subscriptions
UPI AutoPay subscriptions
Human mentorship
Complex coupons
Referral payouts
Affiliate program
WhatsApp automation
SMS campaigns
AI recommendations
Sophisticated adaptive testing
Advanced gamification
Multi-level admin roles
Complex upgrade credit calculations
Native mobile app
```

They can be considered after launch data exists.

---

# 88. Recommended V1.1 Features

Once V1 is stable:

```text
Phone OTP
Coupon codes
Referral codes
WhatsApp notification opt-in
Leaderboard
Advanced analytics
Exam readiness score
Weak-topic recommendations
Plan upgrade flows
Manual admin access grants
Refund workflow
```

---

# 89. Recommended V1.2 / Growth Features

Later:

```text
Multiple exam categories
Personalized test recommendations
Question bookmarking
Custom practice sessions
Saved questions
Revision lists
Adaptive practice
Study plans
Referral rewards
Campaign analytics
Abandoned-checkout recovery
WhatsApp exam reminders
```

---

# 90. Core V1 Success Metrics

The business should not measure success only using:

```text
Registered Users
```

Track this complete funnel:

```text
Visitors
↓
Signup
↓
Started First Mock
↓
Completed First Mock
↓
Completed 3 Free Mocks
↓
Viewed Pricing
↓
Started Checkout
↓
Successful Purchase
```

Key metrics:

```text
Visitor → Signup %
```

```text
Signup → First Test %
```

```text
First Test → Third Free Test %
```

```text
Free User → Paid %
```

```text
Pricing View → Purchase %
```

```text
Average Revenue Per Paying User
```

---

# 91. Primary Admin Dashboard Funnel

Eventually display something similar to:

```text
1,250 Registered Users
        ↓
910 Started a Test
72.8%
        ↓
705 Completed a Test
77.5%
        ↓
410 Completed All Free Tests
58.2%
        ↓
97 Became Paid Users
23.7%
```

This will be significantly more useful than simply showing:

```text
Total users: 1,250
```

---

# 92. Recommended V1 Definition of Done

V1 should not be considered complete until all of the following are true.

## Authentication

```text
✓ User registration works
✓ Full name saved
✓ Phone saved
✓ Email verification works
✓ Login/logout works
✓ Forgot password works
```

## Free Funnel

```text
✓ Visitors can browse tests
✓ Starting a test requires registration
✓ 3 predefined free tests work
✓ Free test results work
✓ Paid tests are securely locked
```

## Payments

```text
✓ Pricing page works
✓ Razorpay checkout works
✓ Payment webhook verified
✓ Pending payment does not grant access
✓ Successful payment grants correct access
✓ Duplicate webhook safe
✓ Failed payment safe
```

## Access

```text
✓ Starter permissions work
✓ Pro permissions work
✓ Complete permissions work
✓ Expiry works
✓ Server-side checks implemented
✓ Direct URL/API bypass fails
```

## Security

```text
✓ RLS enabled
✓ Users cannot read other users' data
✓ Students cannot access admin
✓ Users cannot fake payments
✓ Secrets remain server-side
```

## Admin

```text
✓ User list
✓ Search
✓ Filters
✓ User details
✓ Purchases
✓ Plans
✓ Registration metrics
✓ Paid-user metrics
✓ Revenue
✓ Conversion
```

## Testing

```text
✓ Unit/integration tests
✓ Playwright E2E
✓ Payment test environment
✓ Mobile verification
✓ Production smoke test
```

---

# 93. Recommended Development Priority

If deciding what to work on next, follow this exact order:

```text
1. Profiles + signup fields

2. Authentication security + RLS

3. Three predefined free tests

4. Guest → signup → return-to-test journey

5. Free test attempt/results experience

6. Plans + purchases database

7. Test entitlement/access service

8. Server-side paid test protection

9. Razorpay order creation

10. Razorpay webhook handling

11. Pricing page

12. Current plan / expiry UX

13. Admin users

14. Admin purchases

15. Admin metrics

16. Funnel analytics

17. Launch hardening
```

Do not build advanced analytics before the authentication, test access and payment foundations are reliable.

---

# 94. Final Recommended Architecture

```text
                    ┌──────────────┐
                    │   Visitor    │
                    └──────┬───────┘
                           │
                           ▼
                   ┌───────────────┐
                   │ Public Tests  │
                   │ + Pricing     │
                   └──────┬────────┘
                          │
                         signup
                          │
                          ▼
                    ┌───────────┐
                    │ auth.users│
                    └─────┬─────┘
                          │
                          ▼
                    ┌──────────┐
                    │ profiles │
                    └────┬─────┘
                         │
              ┌──────────┼───────────┐
              │          │           │
              ▼          ▼           ▼
          attempts   purchases    attribution
                         │
                         ▼
                       plans
                         │
                         ▼
                   access service
                         │
                         ▼
                       tests


Razorpay
   │
   ▼
Webhook Endpoint
   │
   ▼
payment_events
   │
   ▼
purchases
   │
   ▼
Paid Access
```

---

# 95. Recommended Product Principle

Every implementation decision should support one of three objectives:

```text
Acquire
Engage
Convert
```

### Acquire

Make registration compelling:

```text
Get 3 NSSB Mock Tests FREE
```

### Engage

Make tests genuinely useful:

```text
Realistic test experience
Instant scoring
Performance tracking
Solutions
Progress
```

### Convert

Demonstrate value before asking for money:

```text
You've completed your free tests.

Unlock the full NSSB test series,
detailed analytics and unlimited practice
from ₹199.
```

The portal should therefore be designed as a **conversion funnel**, not merely a collection of protected mock-test pages.

---

# Final V1 Scope

The first commercial release should primarily deliver:

```text
Secure registration
↓
3 genuinely useful free mocks
↓
Good results experience
↓
Clear value proposition
↓
₹199 / ₹399 / ₹699 access plans
↓
Secure Razorpay payment
↓
Reliable paid test access
↓
Useful admin reporting
↓
Free-to-paid conversion measurement
```

Once this pipeline works reliably and real users start moving through it, future feature decisions can be based on actual behaviour rather than assumptions.