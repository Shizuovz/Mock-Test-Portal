insert into public.exams (id, name, slug, description, is_active)
values (
  '11111111-1111-4111-8111-111111111111',
  'SSC CGL',
  'ssc-cgl',
  'Practice full-length and topic-wise MCQ tests for SSC CGL preparation.',
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  is_active = excluded.is_active;

insert into public.subjects (id, exam_id, name, slug, description, order_index)
values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'Quantitative Aptitude',
  'quantitative-aptitude',
  'Arithmetic, algebra, geometry, and data interpretation.',
  1
)
on conflict (exam_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  order_index = excluded.order_index;

insert into public.topics (id, subject_id, name, slug, description, order_index)
values (
  '33333333-3333-4333-8333-333333333333',
  '22222222-2222-4222-8222-222222222222',
  'Percentage',
  'percentage',
  'Percentage basics and applied percentage problems.',
  1
)
on conflict (subject_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  order_index = excluded.order_index;

insert into public.questions (
  id,
  topic_id,
  question_text,
  question_type,
  difficulty,
  explanation,
  default_marks,
  default_negative_marks,
  status
)
values
  (
    '44444444-4444-4444-8444-444444444441',
    '33333333-3333-4333-8333-333333333333',
    'What is 15% of 200?',
    'single_choice',
    'easy',
    '15% of 200 is 30.',
    2,
    0.5,
    'published'
  ),
  (
    '44444444-4444-4444-8444-444444444442',
    '33333333-3333-4333-8333-333333333333',
    'If a value increases from 80 to 100, what is the percentage increase?',
    'single_choice',
    'easy',
    'The increase is 20 on a base of 80, so 20/80 x 100 = 25%.',
    2,
    0.5,
    'published'
  ),
  (
    '44444444-4444-4444-8444-444444444443',
    '33333333-3333-4333-8333-333333333333',
    'A shopkeeper gives a 10% discount on an item marked at 500. What is the selling price?',
    'single_choice',
    'easy',
    '10% of 500 is 50, so the selling price is 450.',
    2,
    0.5,
    'published'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '33333333-3333-4333-8333-333333333333',
    'What is 40% expressed as a fraction in simplest form?',
    'single_choice',
    'easy',
    '40% is 40/100, which simplifies to 2/5.',
    2,
    0.5,
    'published'
  ),
  (
    '44444444-4444-4444-8444-444444444445',
    '33333333-3333-4333-8333-333333333333',
    'A number is decreased by 20% and becomes 160. What was the original number?',
    'single_choice',
    'medium',
    '160 is 80% of the original number, so original = 160 / 0.8 = 200.',
    2,
    0.5,
    'published'
  )
on conflict (id) do update set
  question_text = excluded.question_text,
  difficulty = excluded.difficulty,
  explanation = excluded.explanation,
  default_marks = excluded.default_marks,
  default_negative_marks = excluded.default_negative_marks,
  status = excluded.status;

insert into public.question_options (
  id,
  question_id,
  option_text,
  is_correct,
  order_index
)
values
  ('77777777-7777-4777-8777-777777777101', '44444444-4444-4444-8444-444444444441', '20', false, 1),
  ('77777777-7777-4777-8777-777777777102', '44444444-4444-4444-8444-444444444441', '25', false, 2),
  ('77777777-7777-4777-8777-777777777103', '44444444-4444-4444-8444-444444444441', '30', true, 3),
  ('77777777-7777-4777-8777-777777777104', '44444444-4444-4444-8444-444444444441', '35', false, 4),
  ('77777777-7777-4777-8777-777777777201', '44444444-4444-4444-8444-444444444442', '20%', false, 1),
  ('77777777-7777-4777-8777-777777777202', '44444444-4444-4444-8444-444444444442', '25%', true, 2),
  ('77777777-7777-4777-8777-777777777203', '44444444-4444-4444-8444-444444444442', '30%', false, 3),
  ('77777777-7777-4777-8777-777777777204', '44444444-4444-4444-8444-444444444442', '40%', false, 4),
  ('77777777-7777-4777-8777-777777777301', '44444444-4444-4444-8444-444444444443', '400', false, 1),
  ('77777777-7777-4777-8777-777777777302', '44444444-4444-4444-8444-444444444443', '425', false, 2),
  ('77777777-7777-4777-8777-777777777303', '44444444-4444-4444-8444-444444444443', '450', true, 3),
  ('77777777-7777-4777-8777-777777777304', '44444444-4444-4444-8444-444444444443', '475', false, 4),
  ('77777777-7777-4777-8777-777777777401', '44444444-4444-4444-8444-444444444444', '1/4', false, 1),
  ('77777777-7777-4777-8777-777777777402', '44444444-4444-4444-8444-444444444444', '2/5', true, 2),
  ('77777777-7777-4777-8777-777777777403', '44444444-4444-4444-8444-444444444444', '3/5', false, 3),
  ('77777777-7777-4777-8777-777777777404', '44444444-4444-4444-8444-444444444444', '4/5', false, 4),
  ('77777777-7777-4777-8777-777777777501', '44444444-4444-4444-8444-444444444445', '180', false, 1),
  ('77777777-7777-4777-8777-777777777502', '44444444-4444-4444-8444-444444444445', '190', false, 2),
  ('77777777-7777-4777-8777-777777777503', '44444444-4444-4444-8444-444444444445', '200', true, 3),
  ('77777777-7777-4777-8777-777777777504', '44444444-4444-4444-8444-444444444445', '220', false, 4)
on conflict (id) do update set
  option_text = excluded.option_text,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;

insert into public.tests (
  id,
  exam_id,
  name,
  slug,
  description,
  duration_minutes,
  total_marks,
  is_published
)
values (
  '55555555-5555-4555-8555-555555555555',
  '11111111-1111-4111-8111-111111111111',
  'SSC CGL Percentage Mini Mock',
  'ssc-cgl-percentage-mini-mock',
  'A short timed MCQ test to validate the first attempt flow.',
  10,
  10,
  true
)
on conflict (exam_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  total_marks = excluded.total_marks,
  is_published = excluded.is_published;

insert into public.test_questions (id, test_id, question_id, order_index, marks, negative_marks)
values
  ('66666666-6666-4666-8666-666666666660', '55555555-5555-4555-8555-555555555555', '44444444-4444-4444-8444-444444444441', 1, 2, 0.5),
  ('66666666-6666-4666-8666-666666666661', '55555555-5555-4555-8555-555555555555', '44444444-4444-4444-8444-444444444442', 2, 2, 0.5),
  ('66666666-6666-4666-8666-666666666662', '55555555-5555-4555-8555-555555555555', '44444444-4444-4444-8444-444444444443', 3, 2, 0.5),
  ('66666666-6666-4666-8666-666666666663', '55555555-5555-4555-8555-555555555555', '44444444-4444-4444-8444-444444444444', 4, 2, 0.5),
  ('66666666-6666-4666-8666-666666666664', '55555555-5555-4555-8555-555555555555', '44444444-4444-4444-8444-444444444445', 5, 2, 0.5)
on conflict (test_id, question_id) do update set
  order_index = excluded.order_index,
  marks = excluded.marks,
  negative_marks = excluded.negative_marks;
