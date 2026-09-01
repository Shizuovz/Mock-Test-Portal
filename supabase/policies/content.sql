create policy "exams_public_read_active"
on public.exams
for select
to anon, authenticated
using (
  is_active = true
  or public.current_user_role() in ('editor', 'admin')
);

create policy "subjects_public_read_active_exam"
on public.subjects
for select
to anon, authenticated
using (
  exists (
    select 1 from public.exams
    where exams.id = subjects.exam_id
      and exams.is_active = true
  )
  or public.current_user_role() in ('editor', 'admin')
);

create policy "topics_public_read_active_exam"
on public.topics
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.subjects
    join public.exams on exams.id = subjects.exam_id
    where subjects.id = topics.subject_id
      and exams.is_active = true
  )
  or public.current_user_role() in ('editor', 'admin')
);

create policy "tests_public_read_published"
on public.tests
for select
to anon, authenticated
using (
  is_published = true
  and exists (
    select 1 from public.exams
    where exams.id = tests.exam_id
      and exams.is_active = true
  )
  or public.current_user_role() in ('editor', 'admin')
);

create policy "test_questions_public_read_published_tests"
on public.test_questions
for select
to anon, authenticated
using (
  exists (
    select 1 from public.tests
    where tests.id = test_questions.test_id
      and tests.is_published = true
  )
  or public.current_user_role() in ('editor', 'admin')
);

create policy "questions_editor_admin_read"
on public.questions
for select
to authenticated
using (public.current_user_role() in ('editor', 'admin'));

create policy "question_options_editor_admin_read"
on public.question_options
for select
to authenticated
using (public.current_user_role() in ('editor', 'admin'));

create policy "exams_editor_admin_write"
on public.exams
for all
to authenticated
using (public.current_user_role() in ('editor', 'admin'))
with check (public.current_user_role() in ('editor', 'admin'));

create policy "subjects_editor_admin_write"
on public.subjects
for all
to authenticated
using (public.current_user_role() in ('editor', 'admin'))
with check (public.current_user_role() in ('editor', 'admin'));

create policy "topics_editor_admin_write"
on public.topics
for all
to authenticated
using (public.current_user_role() in ('editor', 'admin'))
with check (public.current_user_role() in ('editor', 'admin'));

create policy "questions_editor_admin_write"
on public.questions
for all
to authenticated
using (public.current_user_role() in ('editor', 'admin'))
with check (public.current_user_role() in ('editor', 'admin'));

create policy "question_options_editor_admin_write"
on public.question_options
for all
to authenticated
using (public.current_user_role() in ('editor', 'admin'))
with check (public.current_user_role() in ('editor', 'admin'));

create policy "tests_editor_admin_write"
on public.tests
for all
to authenticated
using (public.current_user_role() in ('editor', 'admin'))
with check (public.current_user_role() in ('editor', 'admin'));

create policy "test_questions_editor_admin_write"
on public.test_questions
for all
to authenticated
using (public.current_user_role() in ('editor', 'admin'))
with check (public.current_user_role() in ('editor', 'admin'));
