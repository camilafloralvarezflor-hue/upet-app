-- Mawis — CBU/alias del paseador para cobrar, y el registro de sus pedidos
-- de cobro ("Cobrar ya"). TODO(pagos): no hay integración real con un
-- procesador de pagos/transferencias todavía — ver también
-- src/lib/comision.ts. Este registro deja el terreno listo: cuando se
-- conecte un procesador real, basta con disparar la transferencia al
-- confirmar un payout_request y actualizar su estado.

create type public.payout_estado as enum ('solicitado', 'procesado', 'rechazado');

alter table public.businesses
  add column if not exists cbu_alias text;

create table public.payout_requests (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  monto numeric not null,
  estado public.payout_estado not null default 'solicitado',
  created_at timestamptz not null default now()
);

alter table public.payout_requests enable row level security;

create policy "payout_requests: el paseador ve y crea sus propios pedidos de cobro"
  on public.payout_requests for all
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));
