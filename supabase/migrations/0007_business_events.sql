-- UPET — estadísticas reales del Panel de la empresa (Etapa 8)
-- Registra vistas de la ficha pública y contactos (llamadas / reservas)
-- para poder mostrar "Vistas esta semana" y "Contactos" con datos reales.

create type public.business_event_type as enum ('vista', 'contacto');

create table public.business_events (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  tipo public.business_event_type not null,
  created_at timestamptz not null default now()
);

alter table public.business_events enable row level security;

create policy "business_events: cualquier usuario autenticado puede registrar uno" on public.business_events
  for insert to authenticated
  with check (true);

create policy "business_events: la empresa ve las estadísticas de su negocio" on public.business_events
  for select using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
