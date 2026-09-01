create policy "bookmarks_select_own"
on public.bookmarks
for select
to authenticated
using (user_id = auth.uid());

create policy "bookmarks_insert_own"
on public.bookmarks
for insert
to authenticated
with check (user_id = auth.uid());

create policy "bookmarks_delete_own"
on public.bookmarks
for delete
to authenticated
using (user_id = auth.uid());
