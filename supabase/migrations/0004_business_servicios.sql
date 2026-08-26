-- Mawis — lista de servicios ofrecidos por la empresa (Etapa 5, ficha pública)
-- Columna aditiva y opcional: no estaba en el modelo de datos original de partida.

alter table public.businesses
  add column if not exists servicios text[] not null default '{}';
