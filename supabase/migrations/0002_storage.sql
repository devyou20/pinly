-- =============================================================================
-- Pinly — storage buckets and policies
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('pins', 'pins', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- ---------- pins bucket ------------------------------------------------------
-- Upload path convention: {user_id}/{uuid}.{ext}

drop policy if exists "pin images public read"  on storage.objects;
drop policy if exists "pin images owner upload" on storage.objects;
drop policy if exists "pin images owner delete" on storage.objects;

create policy "pin images public read" on storage.objects for select
  using (bucket_id = 'pins');

create policy "pin images owner upload" on storage.objects for insert
  with check (
    bucket_id = 'pins'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "pin images owner delete" on storage.objects for delete
  using (bucket_id = 'pins' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- avatars bucket ---------------------------------------------------

drop policy if exists "avatars public read"  on storage.objects;
drop policy if exists "avatars owner upload" on storage.objects;
drop policy if exists "avatars owner update" on storage.objects;
drop policy if exists "avatars owner delete" on storage.objects;

create policy "avatars public read" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars owner upload" on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars owner update" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars owner delete" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
