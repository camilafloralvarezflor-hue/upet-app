-- UPET — disponibilidad de turnos (Etapa 8)
-- Función de solo lectura para que un dueño pueda ver qué horarios ya están
-- ocupados en un negocio sin tener acceso (vía RLS) a los turnos de otros
-- dueños. Solo expone la fecha_hora ocupada, ninguna otra columna.

create or replace function public.get_booked_slots(p_business_id uuid, p_day date)
returns table (fecha_hora timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select fecha_hora
  from public.appointments
  where business_id = p_business_id
    and estado <> 'cancelado'
    and fecha_hora >= p_day::timestamptz
    and fecha_hora < (p_day + interval '1 day')::timestamptz;
$$;

grant execute on function public.get_booked_slots(uuid, date) to authenticated;
