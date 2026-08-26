-- Mawis — especialidad de la guardia de emergencia (Etapa 7)
-- Columna aditiva y opcional: no estaba en el modelo de datos original de partida.

alter table public.emergency_contacts
  add column if not exists especialidad text;
