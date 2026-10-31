begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('progress-photos','progress-photos',false,10485760,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy private_photo_read on storage.objects for select to authenticated using(bucket_id='progress-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy private_photo_insert on storage.objects for insert to authenticated with check(bucket_id='progress-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy private_photo_update on storage.objects for update to authenticated using(bucket_id='progress-photos' and (storage.foldername(name))[1]=(select auth.uid())::text) with check(bucket_id='progress-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy private_photo_delete on storage.objects for delete to authenticated using(bucket_id='progress-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
