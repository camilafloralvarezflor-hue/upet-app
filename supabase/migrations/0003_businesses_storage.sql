-- UPET — bucket de Storage para fotos de negocios (Etapa 4)
-- Convención de path: <owner_id>/<business_id>/<n>.jpg

insert into storage.buckets (id, name, public)
values ('businesses', 'businesses', true)
on conflict (id) do nothing;

create policy "businesses bucket: lectura pública"
  on storage.objects for select
  using (bucket_id = 'businesses');

create policy "businesses bucket: el dueño sube sus fotos"
  on storage.objects for insert
  with check (bucket_id = 'businesses' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "businesses bucket: el dueño actualiza sus fotos"
  on storage.objects for update
  using (bucket_id = 'businesses' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "businesses bucket: el dueño borra sus fotos"
  on storage.objects for delete
  using (bucket_id = 'businesses' and (storage.foldername(name))[1] = auth.uid()::text);
