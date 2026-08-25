-- UPET — token de notificaciones push (Etapa 8)

alter table public.profiles
  add column if not exists expo_push_token text;
