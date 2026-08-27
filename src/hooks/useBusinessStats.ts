import { useMutation, useQuery } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { BusinessEventType } from '../lib/database.types';

async function fetchStats(businessId: string) {
  const haceUnaSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: vistas }, { count: contactos }] = await Promise.all([
    supabase
      .from('business_events')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('tipo', 'vista')
      .gte('created_at', haceUnaSemana),
    supabase
      .from('business_events')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('tipo', 'contacto'),
  ]);

  return { vistasEstaSemana: vistas ?? 0, contactos: contactos ?? 0 };
}

export function useBusinessStats(businessId: string | undefined) {
  return useQuery({
    queryKey: ['business_events', 'stats', businessId],
    queryFn: () => fetchStats(businessId as string),
    enabled: !!businessId,
  });
}

export function useLogBusinessEvent() {
  return useMutation({
    mutationFn: async ({
      businessId,
      tipo,
    }: {
      businessId: string;
      tipo: BusinessEventType;
    }) => {
      await supabase.from('business_events').insert({ business_id: businessId, tipo });
    },
  });
}
