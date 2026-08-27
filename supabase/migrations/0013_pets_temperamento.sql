-- Mawis — temperamento y tamaño de la mascota (mockup "Alta de mascota").
-- Lo ve el paseador antes de aceptar el turno.

alter table public.pets
  add column if not exists tamano text check (tamano in ('chico', 'mediano', 'grande')),
  add column if not exists temperamento text[] not null default '{}';
