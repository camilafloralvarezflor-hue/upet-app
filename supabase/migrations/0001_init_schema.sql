-- UPET — esquema inicial (Etapa 1: Fundaciones)
-- Postgres/Supabase con Row Level Security.

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────
create type public.user_role as enum ('dueno', 'empresa');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  nombre text not null,
  telefono text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: lectura pública" on public.profiles
  for select using (true);

create policy "profiles: el usuario gestiona su propio perfil" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- ─────────────────────────────────────────────
-- pets
-- ─────────────────────────────────────────────
create table public.pets (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  nombre text not null,
  especie text not null,
  raza text,
  edad numeric,
  peso numeric,
  foto_url text,
  condiciones_medicas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pets enable row level security;

create policy "pets: el dueño gestiona sus mascotas" on public.pets
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ─────────────────────────────────────────────
-- vaccines
-- ─────────────────────────────────────────────
create type public.vaccine_status as enum ('al_dia', 'proxima', 'vencida');

create table public.vaccines (
  id uuid primary key default uuid_generate_v4(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  nombre text not null,
  fecha_aplicacion date not null,
  proxima_fecha date,
  estado public.vaccine_status not null default 'al_dia',
  created_at timestamptz not null default now()
);

alter table public.vaccines enable row level security;

create policy "vaccines: el dueño de la mascota gestiona sus vacunas" on public.vaccines
  for all using (
    exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- businesses
-- ─────────────────────────────────────────────
create table public.businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  rubro text not null,
  nombre text not null,
  direccion text,
  lat double precision,
  lng double precision,
  horarios jsonb not null default '{}'::jsonb,
  fotos text[] not null default '{}',
  telefono text,
  turnos_habilitado boolean not null default false,
  verificado boolean not null default false,
  boost_activo boolean not null default false,
  boost_vence timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

create policy "businesses: lectura pública" on public.businesses
  for select using (true);

create policy "businesses: la empresa gestiona su propio perfil" on public.businesses
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ─────────────────────────────────────────────
-- reviews
-- ─────────────────────────────────────────────
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  calificacion smallint not null check (calificacion between 1 and 5),
  comentario text,
  respuesta_empresa text,
  vinculada_a_visita boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "reviews: lectura pública" on public.reviews
  for select using (true);

create policy "reviews: el dueño crea/edita su propia reseña" on public.reviews
  for insert with check (auth.uid() = owner_id);

create policy "reviews: el dueño actualiza su propia reseña" on public.reviews
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "reviews: la empresa responde reseñas sobre su negocio" on public.reviews
  for update using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- emergency_contacts
-- ─────────────────────────────────────────────
create table public.emergency_contacts (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  telefono text not null,
  direccion text,
  lat double precision,
  lng double precision,
  horario_guardia text,
  verificado_en timestamptz,
  created_at timestamptz not null default now()
);

alter table public.emergency_contacts enable row level security;

create policy "emergency_contacts: lectura pública" on public.emergency_contacts
  for select using (true);

-- ─────────────────────────────────────────────
-- appointments
-- (campos tipo_servicio / requiere_seguimiento dejan preparado el terreno
--  para un futuro módulo de paseos con seguimiento GPS — no se construye en este MVP)
-- ─────────────────────────────────────────────
create type public.appointment_status as enum ('pendiente', 'confirmado', 'cancelado');

create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  fecha_hora timestamptz not null,
  estado public.appointment_status not null default 'pendiente',
  tipo_servicio text,
  requiere_seguimiento boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appointments enable row level security;

create policy "appointments: el dueño ve y crea sus turnos" on public.appointments
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "appointments: la empresa ve y gestiona los turnos de su negocio" on public.appointments
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
