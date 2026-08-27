-- Mawis — franjas horarias en las que el paseador está disponible para
-- recibir turnos (pantalla "Ganancias y disponibilidad").

alter table public.businesses
  add column if not exists disponibilidad jsonb not null default '{"mananas": true, "tardes": true, "finde": false}'::jsonb;
