create policy "test_attempts_select_own_or_admin"
on public.test_attempts
for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_user_role() = 'admin'
);

create policy "test_attempts_insert_own_in_progress"
on public.test_attempts
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'in_progress'
);

create policy "test_attempts_admin_update"
on public.test_attempts
for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "user_answers_select_own_or_admin"
on public.user_answers
for select
to authenticated
using (
  exists (
    select 1 from public.test_attempts
    where test_attempts.id = user_answers.attempt_id
      and test_attempts.user_id = auth.uid()
  )
  or public.current_user_role() = 'admin'
);

create policy "user_answers_insert_own_active_attempt"
on public.user_answers
for insert
to authenticated
with check (
  exists (
    select 1 from public.test_attempts
    where test_attempts.id = user_answers.attempt_id
      and test_attempts.user_id = auth.uid()
      and test_attempts.status = 'in_progress'
      and test_attempts.expires_at > now()
  )
);

create policy "user_answers_update_own_active_attempt"
on public.user_answers
for update
to authenticated
using (
  exists (
    select 1 from public.test_attempts
    where test_attempts.id = user_answers.attempt_id
      and test_attempts.user_id = auth.uid()
      and test_attempts.status = 'in_progress'
      and test_attempts.expires_at > now()
  )
)
with check (
  exists (
    select 1 from public.test_attempts
    where test_attempts.id = user_answers.attempt_id
      and test_attempts.user_id = auth.uid()
      and test_attempts.status = 'in_progress'
      and test_attempts.expires_at > now()
  )
);

create policy "audit_logs_admin_read"
on public.audit_logs
for select
to authenticated
using (public.current_user_role() = 'admin');

create policy "audit_logs_admin_insert"
on public.audit_logs
for insert
to authenticated
with check (public.current_user_role() = 'admin');
