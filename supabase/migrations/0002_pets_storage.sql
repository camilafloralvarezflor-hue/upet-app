-- UPET — bucket de Storage para fotos de mascotas (Etapa 3)
-- Convención de path: <owner_id>/<pet_id>.jpg

insert into storage.buckets (id, name, public)
values ('pets', 'pets', true)
on conflict (id) do nothing;

create policy "pets bucket: lectura pública"
  on storage.objects for select
  using (bucket_id = 'pets');

create policy "pets bucket: el dueño sube sus fotos"
  on storage.objects for insert
  with check (bucket_id = 'pets' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "pets bucket: el dueño actualiza sus fotos"
  on storage.objects for update
  using (bucket_id = 'pets' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "pets bucket: el dueño borra sus fotos"
  on storage.objects for delete
  using (bucket_id = 'pets' and (storage.foldername(name))[1] = auth.uid()::text);
