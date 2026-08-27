import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { calcularNeto } from '../lib/comision';

const DIA_LABEL = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function inicioDeSemana(fecha: Date) {
  const dia = fecha.getDay();
  const diff = dia === 0 ? -6 : 1 - dia; // semana arranca el lunes
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(inicio.getDate() + diff);
  return inicio;
}

export interface GananciasSemana {
  totalNeto: number;
  porDia: { label: string; neto: number }[];
  paseos: number;
  cancelados: number;
}

async function fetchGananciasSemana(businessId: string): Promise<GananciasSemana> {
  const inicio = inicioDeSemana(new Date());
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 7);

  const { data, error } = await supabase
    .from('appointments')
    .select('fecha_hora, estado, monto, comision_pct')
    .eq('business_id', businessId)
    .gte('fecha_hora', inicio.toISOString())
    .lt('fecha_hora', fin.toISOString());
  if (error) throw error;

  const porDia = Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(inicio);
    dia.setDate(dia.getDate() + i);
    return { label: DIA_LABEL[dia.getDay()], neto: 0 };
  });

  let totalNeto = 0;
  let paseos = 0;
  let cancelados = 0;

  for (const turno of data ?? []) {
    if (turno.estado === 'cancelado') {
      cancelados += 1;
      continue;
    }
    if (turno.estado !== 'completado' || turno.monto == null || turno.comision_pct == null) continue;
    const { neto } = calcularNeto(turno.monto, turno.comision_pct);
    totalNeto += neto;
    paseos += 1;
    const indice = Math.floor(
      (new Date(turno.fecha_hora).getTime() - inicio.getTime()) / (24 * 60 * 60 * 1000)
    );
    if (porDia[indice]) porDia[indice].neto += neto;
  }

  return { totalNeto, porDia, paseos, cancelados };
}

export function useGanancias(businessId: string | undefined) {
  return useQuery({
    queryKey: ['ganancias', 'semana', businessId],
    queryFn: () => fetchGananciasSemana(businessId as string),
    enabled: !!businessId,
  });
}

export function useCobrarYa(businessId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (monto: number) => {
      if (!businessId) throw new Error('Falta el negocio.');
      const { error } = await supabase.from('payout_requests').insert({ business_id: businessId, monto });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout_requests', businessId] });
    },
  });
}
