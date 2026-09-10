-- Migration 0011: Production Hardening, Answer Key Separation, Snapshots, Webhook Deduplication, Outbox & Atomic RPCs

-- ============================================================================
-- 1. SEPARATE SENSITIVE ANSWER KEYS (Exam Security)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.question_answer_keys (
  question_id UUID PRIMARY KEY REFERENCES public.questions(id) ON DELETE CASCADE,
  correct_option_id UUID NOT NULL REFERENCES public.question_options(id) ON DELETE CASCADE,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Backfill answer keys from existing question_options
INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
SELECT q.id, qo.id, q.explanation
FROM public.questions q
JOIN public.question_options qo ON qo.question_id = q.id AND qo.is_correct = true
ON CONFLICT (question_id) DO UPDATE
SET correct_option_id = EXCLUDED.correct_option_id,
    explanation = EXCLUDED.explanation,
    updated_at = now();

-- Enable RLS on question_answer_keys (Blocked to students, only accessible via Server Role / Admin)
ALTER TABLE public.question_answer_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to question answer keys" ON public.question_answer_keys;
CREATE POLICY "Admins have full access to question answer keys" ON public.question_answer_keys
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- ============================================================================
-- 2. PLANS TABLE ALTERATION & SEED
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_paise INTEGER NOT NULL CHECK (price_paise > 0),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS credits INTEGER;

INSERT INTO public.plans (code, name, price_paise, currency, duration_days, credits, is_active)
VALUES 
  ('all_access_12m', 'All-Access Pass (12 Months)', 49900, 'INR', 365, NULL, true)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    price_paise = EXCLUDED.price_paise,
    duration_days = EXCLUDED.duration_days,
    is_active = EXCLUDED.is_active,
    updated_at = now();

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active plans" ON public.plans;
CREATE POLICY "Anyone can view active plans" ON public.plans
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins have full access to plans" ON public.plans;
CREATE POLICY "Admins have full access to plans" ON public.plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 3. PAYMENTS SNAPSHOT FIELDS & SCHEMA UNIQUENESS
-- ============================================================================
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS plan_code TEXT,
  ADD COLUMN IF NOT EXISTS plan_name TEXT,
  ADD COLUMN IF NOT EXISTS duration_days INTEGER,
  ADD COLUMN IF NOT EXISTS credits INTEGER,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS terms_snapshot JSONB DEFAULT '{}'::jsonb;

-- Adjust amount_paise default / check
ALTER TABLE public.payments 
  ALTER COLUMN amount_paise SET DEFAULT 49900;

-- Status constraint check
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check 
  CHECK (status IN ('created', 'pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'));

-- Schema-level uniqueness guarantee on payments
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_provider_payment_unique;
ALTER TABLE public.payments ADD CONSTRAINT payments_provider_payment_unique 
  UNIQUE (provider, provider_payment_id);

-- Subscriptions schema-level uniqueness for defense in depth
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS source_payment_id UUID UNIQUE REFERENCES public.payments(id) ON DELETE SET NULL;

-- ============================================================================
-- 4. PAYMENT EVENTS (Webhook Deduplication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway TEXT NOT NULL,
  gateway_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_events_gateway_event_idx ON public.payment_events(gateway_event_id);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view payment events" ON public.payment_events;
CREATE POLICY "Admins can view payment events" ON public.payment_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 5. EMAIL OUTBOX (Decoupled Resend Delivery)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  template_type TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS email_outbox_status_idx ON public.email_outbox(status);

ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view email outbox" ON public.email_outbox;
CREATE POLICY "Admins can view email outbox" ON public.email_outbox
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 6. SYSTEM SETTINGS (Runtime Emergency Kill Switch)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.system_settings (key, value, description)
VALUES 
  ('checkout_enabled', 'true'::jsonb, 'Master kill switch for payment checkout'),
  ('maintenance_mode', 'false'::jsonb, 'Portal wide maintenance toggle')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;
CREATE POLICY "Anyone can read system settings" ON public.system_settings
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admins have full access to system settings" ON public.system_settings;
CREATE POLICY "Admins have full access to system settings" ON public.system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 7. SERVERLESS RATE LIMITING TABLE & ATOMIC DB FUNCTION
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rate_limit_entries (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS rate_limit_entries_reset_idx ON public.rate_limit_entries(reset_at);

ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_entry RECORD;
BEGIN
  -- Cleanup expired row if exists
  DELETE FROM public.rate_limit_entries 
  WHERE key = p_key AND reset_at <= v_now;

  -- Insert new or increment existing
  INSERT INTO public.rate_limit_entries (key, count, reset_at)
  VALUES (p_key, 1, v_now + (p_window_seconds || ' seconds')::interval)
  ON CONFLICT (key) DO UPDATE
  SET count = public.rate_limit_entries.count + 1
  RETURNING count INTO v_entry;

  IF v_entry.count > p_limit THEN
    RETURN false; -- Limit exceeded
  END IF;

  RETURN true; -- Allowed
END;
$$;

-- ============================================================================
-- 8. ATOMIC PAYMENT FULFILLMENT FUNCTION (PostgreSQL RPC)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fulfill_payment_order_atomic(
  p_provider_order_id TEXT,
  p_provider_payment_id TEXT,
  p_gateway_event_id TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment RECORD;
  v_subscription RECORD;
  v_starts_at TIMESTAMPTZ := now();
  v_expires_at TIMESTAMPTZ;
  v_duration_days INTEGER;
  v_customer_email TEXT;
BEGIN
  -- 1. Webhook Deduplication check
  IF p_gateway_event_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.payment_events WHERE gateway_event_id = p_gateway_event_id) THEN
      RETURN jsonb_build_object('success', true, 'message', 'Event already processed (idempotent duplicate)');
    END IF;
  END IF;

  -- 2. Lock payment row
  SELECT * INTO v_payment 
  FROM public.payments 
  WHERE provider_order_id = p_provider_order_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment order not found');
  END IF;

  -- 3. Idempotency: If already captured, exit safely
  IF v_payment.status = 'captured' THEN
    IF p_gateway_event_id IS NOT NULL THEN
      INSERT INTO public.payment_events (gateway, gateway_event_id, event_type, payload)
      VALUES ('razorpay', p_gateway_event_id, 'duplicate_reconciliation', p_payload)
      ON CONFLICT (gateway_event_id) DO NOTHING;
    END IF;
    RETURN jsonb_build_object('success', true, 'message', 'Payment already fulfilled');
  END IF;

  -- 4. Compute validity window
  v_duration_days := COALESCE(v_payment.duration_days, (v_payment.terms_snapshot->>'duration_days')::integer, 365);
  v_expires_at := v_starts_at + (v_duration_days || ' days')::interval;

  -- 5. Create active subscription with source_payment_id uniqueness
  INSERT INTO public.subscriptions (
    user_id, plan_id, status, starts_at, expires_at, source_payment_id
  ) VALUES (
    v_payment.user_id, v_payment.plan_id, 'active', v_starts_at, v_expires_at, v_payment.id
  ) RETURNING * INTO v_subscription;

  -- 6. Mark payment captured
  UPDATE public.payments SET
    status = 'captured',
    provider_payment_id = p_provider_payment_id,
    subscription_id = v_subscription.id,
    updated_at = now()
  WHERE id = v_payment.id;

  -- 7. Queue receipt in email_outbox (Only if verified email exists)
  v_customer_email := v_payment.customer_email;
  IF v_customer_email IS NULL THEN
    SELECT email INTO v_customer_email FROM auth.users WHERE id = v_payment.user_id;
  END IF;

  IF v_customer_email IS NOT NULL AND v_customer_email NOT LIKE '%@placeholder%' THEN
    INSERT INTO public.email_outbox (
      user_id, recipient_email, template_type, idempotency_key, payload
    ) VALUES (
      v_payment.user_id,
      v_customer_email,
      'purchase_receipt',
      'receipt_' || p_provider_order_id,
      jsonb_build_object(
        'orderId', p_provider_order_id,
        'paymentId', p_provider_payment_id,
        'amountPaise', v_payment.amount_paise,
        'currency', v_payment.currency,
        'planName', v_payment.plan_name,
        'expiresAt', v_expires_at
      )
    ) ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  -- 8. Record webhook event
  IF p_gateway_event_id IS NOT NULL THEN
    INSERT INTO public.payment_events (gateway, gateway_event_id, event_type, payload)
    VALUES ('razorpay', p_gateway_event_id, 'payment.captured', p_payload)
    ON CONFLICT (gateway_event_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object('success', true, 'subscriptionId', v_subscription.id, 'paymentId', v_payment.id);
END;
$$;

-- ============================================================================
-- 9. ATOMIC EXAM SUBMISSION & EVALUATION FUNCTION (PostgreSQL RPC)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.submit_exam_attempt_atomic(
  p_attempt_id UUID,
  p_user_id UUID,
  p_pacing_data JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt RECORD;
  v_test RECORD;
  v_total_questions INTEGER := 0;
  v_correct_count INTEGER := 0;
  v_incorrect_count INTEGER := 0;
  v_unanswered_count INTEGER := 0;
  v_score NUMERIC := 0;
  v_accuracy NUMERIC := 0;
  v_now TIMESTAMPTZ := now();
  v_existing_result RECORD;
BEGIN
  -- 1. Lock attempt row
  SELECT * INTO v_attempt 
  FROM public.test_attempts 
  WHERE id = p_attempt_id AND (user_id = p_user_id OR (user_id IS NULL AND p_user_id IS NULL))
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Attempt not found or unauthorized');
  END IF;

  -- 2. Idempotency check: if already evaluated, return existing result
  IF v_attempt.status IN ('submitted', 'evaluated') THEN
    SELECT * INTO v_existing_result FROM public.results WHERE attempt_id = p_attempt_id LIMIT 1;
    RETURN jsonb_build_object(
      'success', true, 
      'message', 'Attempt already submitted',
      'totalScore', COALESCE(v_existing_result.total_score, 0),
      'accuracyPercentage', COALESCE(v_existing_result.accuracy_percentage, 0)
    );
  END IF;

  -- 3. Retrieve test configuration
  SELECT * INTO v_test FROM public.tests WHERE id = v_attempt.test_id;

  -- 4. Calculate score server-side using question_answer_keys
  WITH answer_eval AS (
    SELECT 
      tq.question_id,
      COALESCE(tq.marks, q.default_marks, 1) as marks,
      COALESCE(tq.negative_marks, q.default_negative_marks, 0) as negative_marks,
      ua.selected_option_id,
      ak.correct_option_id,
      CASE 
        WHEN ua.selected_option_id IS NULL THEN 'unanswered'
        WHEN ua.selected_option_id = ak.correct_option_id THEN 'correct'
        ELSE 'incorrect'
      END AS status
    FROM public.test_questions tq
    JOIN public.questions q ON q.id = tq.question_id
    LEFT JOIN public.question_answer_keys ak ON ak.question_id = tq.question_id
    LEFT JOIN public.user_answers ua ON ua.attempt_id = p_attempt_id AND ua.question_id = tq.question_id
    WHERE tq.test_id = v_attempt.test_id
  )
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'correct'),
    COUNT(*) FILTER (WHERE status = 'incorrect'),
    COUNT(*) FILTER (WHERE status = 'unanswered'),
    COALESCE(SUM(CASE 
      WHEN status = 'correct' THEN marks 
      WHEN status = 'incorrect' THEN -negative_marks 
      ELSE 0 
    END), 0)
  INTO 
    v_total_questions,
    v_correct_count,
    v_incorrect_count,
    v_unanswered_count,
    v_score
  FROM answer_eval;

  IF (v_correct_count + v_incorrect_count) > 0 THEN
    v_accuracy := ROUND((v_correct_count::numeric / (v_correct_count + v_incorrect_count)::numeric) * 100, 2);
  ELSE
    v_accuracy := 0;
  END IF;

  -- 5. Mark attempt evaluated
  UPDATE public.test_attempts SET
    status = 'evaluated',
    submitted_at = v_now,
    updated_at = v_now
  WHERE id = p_attempt_id;

  -- 6. Insert results record atomically
  INSERT INTO public.results (
    attempt_id, total_score, max_possible_score, accuracy_percentage,
    correct_answers_count, incorrect_answers_count, unattempted_count,
    time_taken_seconds, question_pacing, subject_breakdown
  ) VALUES (
    p_attempt_id,
    v_score,
    COALESCE(v_test.total_marks, v_total_questions),
    v_accuracy,
    v_correct_count,
    v_incorrect_count,
    v_unanswered_count,
    GREATEST(0, EXTRACT(EPOCH FROM (v_now - v_attempt.started_at))::integer),
    p_pacing_data,
    '{}'::jsonb
  ) ON CONFLICT (attempt_id) DO UPDATE
  SET total_score = EXCLUDED.total_score,
      accuracy_percentage = EXCLUDED.accuracy_percentage,
      question_pacing = EXCLUDED.question_pacing;

  RETURN jsonb_build_object(
    'success', true,
    'totalScore', v_score,
    'accuracyPercentage', v_accuracy,
    'correctCount', v_correct_count,
    'incorrectCount', v_incorrect_count
  );
END;
$$;
