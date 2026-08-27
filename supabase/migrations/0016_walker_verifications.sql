-- Mawis — verificación del paseador (DNI, selfie, antecedentes, primeros
-- auxilios). Bucket privado: solo el propio paseador puede leer/subir sus
-- documentos — no hay panel de revisión todavía, se audita desde Supabase
-- directamente hasta que exista un rol de administración.

create type public.verificacion_estado as enum ('pendiente', 'en_revision', 'validado', 'rechazado');

create table public.walker_verifications (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  tipo text not null check (tipo in ('dni', 'selfie', 'antecedentes', 'primeros_auxilios')),
  estado public.verificacion_estado not null default 'pendiente',
  archivo_url text,
  validado_en timestamptz,
  created_at timestamptz not null default now(),
  unique (business_id, tipo)
);

alter table public.walker_verifications enable row level security;

create policy "walker_verifications: el paseador gestiona su propia verificación"
  on public.walker_verifications for all
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('verificaciones', 'verificaciones', false)
on conflict (id) do nothing;

create policy "verificaciones bucket: el paseador gestiona sus propios documentos"
  on storage.objects for all
  using (bucket_id = 'verificaciones' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'verificaciones' and (storage.foldername(name))[1] = auth.uid()::text);
