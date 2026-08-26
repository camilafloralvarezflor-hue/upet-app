-- Mawis — paseo grupal (varios turnos, mismo paseador y horario, agrupados por
-- grupo_id) y check-in con QR (el paseador muestra un código, el dueño lo
-- escanea y ahí arranca el paseo — alternativa al botón manual "Iniciar paseo").

alter table public.appointments
  add column if not exists grupo_id uuid,
  add column if not exists codigo_checkin text,
  add column if not exists checkin_en timestamptz;

create index if not exists appointments_grupo_id_idx on public.appointments (grupo_id) where grupo_id is not null;
create unique index if not exists appointments_codigo_checkin_idx on public.appointments (codigo_checkin) where codigo_checkin is not null;
