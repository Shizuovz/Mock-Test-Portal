# Production Operations & Disaster Recovery Runbook
## Next.js + Supabase Mock Test Portal

---

## 1. Disaster Recovery & Backup Strategy

### Operational Targets
- **Target RPO (Recovery Point Objective):** < 1 hour (enabled via automated Supabase daily backups and Point-In-Time-Recovery / WAL archiving).
- **Target RTO (Recovery Time Objective):** < 30 minutes for database restore and service re-connection.

### Critical Application Tables
1. `profiles` & `user_entitlements`
2. `plans`, `payments`, & `subscriptions`
3. `tests`, `questions`, `question_options`, & `question_answer_keys`
4. `test_attempts`, `user_answers`, & `results`
5. `payment_events` & `email_outbox`

### Staging Restore Rehearsal Procedure
A backup must never be considered verified without an actual restore rehearsal:
```bash
# 1. Export staging database dump
supabase db dump -f staging_rehearsal_dump.sql

# 2. Spin up an isolated target PostgreSQL instance
createdb mock_portal_restore_test

# 3. Restore dump
psql -d mock_portal_restore_test -f staging_rehearsal_dump.sql

# 4. Execute 7-Point Integrity Verification:
#    a. Check all tables exist: \dt public.*
#    b. Check foreign keys and cascade constraints: \d+ public.user_answers
#    c. Check RLS is enabled: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
#    d. Test RPCs: SELECT public.check_rate_limit('test_key', 5, 60);
#    e. Validate auth user foreign relationships.
#    f. Validate known payment -> subscription link.
#    g. Validate known attempt -> answers -> result link.
```

---

## 2. Emergency Operational Controls

### 2.1 Master Checkout Kill Switch
If payment reconciliation issues, upstream gateway degradation, or fraud anomalies occur, disable checkout instantly without code deployment:
```sql
-- Disable order creation immediately
UPDATE public.system_settings
SET value = 'false'::jsonb, updated_at = now()
WHERE key = 'checkout_enabled';

-- Re-enable checkout once resolved
UPDATE public.system_settings
SET value = 'true'::jsonb, updated_at = now()
WHERE key = 'checkout_enabled';
```

### 2.2 Portal Maintenance Mode
```sql
UPDATE public.system_settings
SET value = 'true'::jsonb, updated_at = now()
WHERE key = 'maintenance_mode';
```

---

## 3. Manual Payment Reconciliation

If a student's payment succeeds on Razorpay but webhook delivery fails or was delayed:
1. Locate the **Razorpay Order ID** (`order_xxxx`) and **Payment ID** (`pay_xxxx`) in the Razorpay Dashboard.
2. Verify the amount matches ₹499 (49900 paise).
3. Execute the atomic fulfillment RPC directly in Supabase SQL Editor:
```sql
SELECT public.fulfill_payment_order_atomic(
  p_provider_order_id := 'order_xxxx',
  p_provider_payment_id := 'pay_xxxx',
  p_gateway_event_id := 'manual_recon_' || now()::text,
  p_payload := '{"source": "admin_manual_reconciliation"}'::jsonb
);
```
4. Confirm `subscriptions` row is active and links to the user account.

---

## 4. Email Deliverability (Resend DNS Configuration)

To ensure high inbox placement for purchase receipts and auth recovery emails:
- **Sending Domain:** `mocktestportal.com` (or subdomain `mail.mocktestportal.com`)
- **Required DNS Records:**
  - `TXT` for SPF: `v=spf1 include:amazonses.com ~all`
  - `CNAME` for DKIM (provided in Resend Dashboard)
  - `TXT` for DMARC: `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@mocktestportal.com; pct=100`

---

## 5. Deployment & Rollback Strategy

1. **Forward-Fix Principle:** Database schema migrations are strictly additive (backwards-compatible). Never execute destructive `DROP COLUMN` down-migrations during an incident.
2. **Instant Deployment Rollback:** In the event of a frontend or SSR defect, roll back instantly in the Vercel Dashboard to the previous healthy deployment commit without modifying the database.
3. **Healthcheck Monitoring:** Automated monitoring monitors `https://mocktestportal.com/api/health` every 60 seconds with an alert threshold > 2s latency or HTTP 503.
