-- UPET — una reseña por dueño y negocio (Etapa 6)

alter table public.reviews
  add constraint reviews_business_owner_unique unique (business_id, owner_id);
