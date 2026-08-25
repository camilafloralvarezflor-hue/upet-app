-- UPET — restringe qué columnas de profiles son públicas (Etapa 8)
--
-- La política de RLS "profiles: lectura pública" (USING (true)) sigue
-- vigente a nivel de fila, pero ahora que agregamos expo_push_token
-- (y ya existía telefono) no queremos que esas columnas sensibles viajen
-- en cualquier `select *` o embed público. Postgres permite restringir
-- por columna además de por fila: revocamos el select amplio y sólo
-- otorgamos las columnas que el resto de la app necesita mostrar
-- públicamente (nombre, avatar, role).
--
-- El token de push se sigue pudiendo usar para notificar: se expone
-- únicamente a través de una función security definer, invocable solo
-- por usuarios autenticados, que no permite listar tokens al voleo.

revoke select on public.profiles from anon, authenticated;

grant select (id, role, nombre, avatar_url, created_at, updated_at)
  on public.profiles to anon, authenticated;

create or replace function public.get_push_token(p_user_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select expo_push_token from public.profiles where id = p_user_id;
$$;

grant execute on function public.get_push_token(uuid) to authenticated;
