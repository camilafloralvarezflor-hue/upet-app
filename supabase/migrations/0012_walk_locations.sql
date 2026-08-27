-- Mawis — tracking en vivo del paseo (cambio de producto)
--
-- Guarda puntos de ubicación del paseador mientras el turno está "en_curso".
-- Solo se puede insertar mientras el turno sigue en ese estado — apenas pasa
-- a "completado" o "cancelado" deja de aceptar posiciones nuevas.

create table public.walk_locations (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  recorded_at timestamptz not null default now()
);

create index walk_locations_appointment_id_idx on public.walk_locations (appointment_id, recorded_at);

alter table public.walk_locations enable row level security;

create policy "walk_locations: el paseador publica su posición durante el paseo en curso"
  on public.walk_locations for insert
  with check (
    exists (
      select 1
      from public.appointments a
      join public.businesses b on b.id = a.business_id
      where a.id = appointment_id
        and a.estado = 'en_curso'
        and b.owner_id = auth.uid()
    )
  );

create policy "walk_locations: el dueño y el paseador ven el recorrido de su turno"
  on public.walk_locations for select
  using (
    exists (
      select 1
      from public.appointments a
      join public.businesses b on b.id = a.business_id
      where a.id = appointment_id
        and (a.owner_id = auth.uid() or b.owner_id = auth.uid())
    )
  );

alter publication supabase_realtime add table public.walk_locations;
