-- Allow video uploads in invitation-assets bucket
-- Previously only image/audio MIME types were allowed, blocking video uploads

update storage.buckets
set file_size_limit = 104857600, -- 100 MiB (was 10 MiB)
    allowed_mime_types = array[
      -- Images
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      -- Audio
      'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4', 'audio/x-m4a',
      -- Video (NEW)
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'
    ]
where id = 'invitation-assets';

-- Delete: pemilik folder boleh hapus file miliknya
drop policy if exists "invitation_assets_delete" on storage.objects;
create policy "invitation_assets_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'invitation-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
