-- Mawis — estados de paseo en curso/completado + modelo de comisión (cambio de producto)
--
-- appointment_status pasa de (pendiente/confirmado/cancelado) a incluir
-- también "en_curso" (el paseo está pasando ahora mismo, habilita el
-- tracking en vivo) y "completado" (el paseo terminó y el prestador ya
-- cargó lo que cobró).
--
-- Nota: ALTER TYPE ... ADD VALUE va en su propia migración porque Postgres
-- no permite usar el valor nuevo de un enum dentro de la misma transacción
-- en la que se lo agrega.

alter type public.appointment_status add value if not exists 'en_curso' after 'confirmado';
alter type public.appointment_status add value if not exists 'completado' after 'en_curso';

-- monto: lo que el prestador cobró por el servicio (todavía no hay
-- procesador de pagos real conectado — ver TODO en src/lib/comision.ts).
-- comision_pct: guarda el % vigente en el momento en que se cargó el monto,
-- para que un cambio futuro en la comisión no altere turnos ya cobrados.
alter table public.appointments
  add column if not exists monto numeric,
  add column if not exists comision_pct numeric,
  add column if not exists pagado boolean not null default false;
