-- Create a new private bucket 'spot_images'
insert into storage.buckets (id, name, public)
values ('spot_images', 'spot_images', true);

-- Policy to allow public SELECT access to all files in the bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'spot_images' );

-- Policy to allow authenticated users to INSERT files
create policy "Authenticated Insert"
  on storage.objects for insert
  with check ( bucket_id = 'spot_images' and auth.role() = 'authenticated' );

-- Policy to allow authenticated users to UPDATE files
create policy "Authenticated Update"
  on storage.objects for update
  using ( bucket_id = 'spot_images' and auth.role() = 'authenticated' );

-- Policy to allow authenticated users to DELETE files
create policy "Authenticated Delete"
  on storage.objects for delete
  using ( bucket_id = 'spot_images' and auth.role() = 'authenticated' );
