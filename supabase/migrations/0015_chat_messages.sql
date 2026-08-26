-- Mawis — chat entre el dueño y el paseador, atado a un turno.

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  texto text,
  foto_url text,
  created_at timestamptz not null default now(),
  constraint messages_contenido_check check (texto is not null or foto_url is not null)
);

create index messages_appointment_id_idx on public.messages (appointment_id, created_at);

alter table public.messages enable row level security;

create policy "messages: el dueño y el paseador del turno leen la conversación"
  on public.messages for select
  using (
    exists (
      select 1 from public.appointments a
      join public.businesses b on b.id = a.business_id
      where a.id = appointment_id and (a.owner_id = auth.uid() or b.owner_id = auth.uid())
    )
  );

create policy "messages: el dueño y el paseador del turno escriben en la conversación"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.appointments a
      join public.businesses b on b.id = a.business_id
      where a.id = appointment_id and (a.owner_id = auth.uid() or b.owner_id = auth.uid())
    )
  );

alter publication supabase_realtime add table public.messages;
