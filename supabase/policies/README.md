Apply these SQL files after `supabase/migrations/0001_initial_schema.sql`.

Recommended order:

1. `profiles.sql`
2. `content.sql`
3. `attempts.sql`
4. `bookmarks.sql`
5. `supabase/seed.sql`

The application uses route handlers for sensitive attempt work. Student clients should
not read `question_options.is_correct`; server-side code uses the service-role key only
inside trusted route helpers.
