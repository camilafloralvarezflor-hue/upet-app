import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { Vaccine } from '../lib/database.types';
import { computeVaccineStatus } from '../lib/vaccine-status';

export type VaccineInput = {
  nombre: string;
  fecha_aplicacion: string;
  proxima_fecha: string | null;
};

async function fetchVaccines(petId: string): Promise<Vaccine[]> {
  const { data, error } = await supabase
    .from('vaccines')
    .select('*')
    .eq('pet_id', petId)
    .order('fecha_aplicacion', { ascending: false });

  if (error) throw error;
  return data;
}

export function useVaccines(petId: string | undefined) {
  return useQuery({
    queryKey: ['vaccines', petId],
    queryFn: () => fetchVaccines(petId as string),
    enabled: !!petId,
  });
}

export function useCreateVaccine(petId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VaccineInput) => {
      const { data, error } = await supabase
        .from('vaccines')
        .insert({
          ...input,
          pet_id: petId,
          estado: computeVaccineStatus(input.proxima_fecha),
        })
        .select()
        .single();
      if (error) throw error;
      return data as Vaccine;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccines', petId] });
    },
  });
}

export function useUpdateVaccine(petId: string, vaccineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VaccineInput) => {
      const { data, error } = await supabase
        .from('vaccines')
        .update({
          ...input,
          estado: computeVaccineStatus(input.proxima_fecha),
        })
        .eq('id', vaccineId)
        .select()
        .single();
      if (error) throw error;
      return data as Vaccine;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccines', petId] });
    },
  });
}

export function useDeleteVaccine(petId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vaccineId: string) => {
      const { error } = await supabase.from('vaccines').delete().eq('id', vaccineId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccines', petId] });
    },
  });
}
