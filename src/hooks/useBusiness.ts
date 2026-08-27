import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { useSession } from '../lib/auth-context';
import type { Business } from '../lib/database.types';

export type BusinessInput = Omit<
  Business,
  | 'id'
  | 'owner_id'
  | 'created_at'
  | 'updated_at'
  | 'verificado'
  | 'boost_activo'
  | 'boost_vence'
  | 'cbu_alias'
  | 'disponibilidad'
>;

async function fetchMyBusiness(ownerId: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function useMyBusiness() {
  const { session } = useSession();
  const ownerId = session?.user.id;

  return useQuery({
    queryKey: ['business', 'mine', ownerId],
    queryFn: () => fetchMyBusiness(ownerId as string),
    enabled: !!ownerId,
  });
}

export function useCreateBusiness() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const ownerId = session?.user.id as string;

  return useMutation({
    mutationFn: async (input: BusinessInput) => {
      const { data, error } = await supabase
        .from('businesses')
        .insert({ ...input, owner_id: ownerId })
        .select()
        .single();
      if (error) throw error;
      return data as Business;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', 'mine', ownerId] });
    },
  });
}

export function useUpdateBusiness(id: string) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const ownerId = session?.user.id;

  return useMutation({
    mutationFn: async (
      input: Partial<BusinessInput> & {
        fotos?: string[];
        boost_activo?: boolean;
        boost_vence?: string | null;
        disponibilidad?: Business['disponibilidad'];
      }
    ) => {
      const { data, error } = await supabase
        .from('businesses')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Business;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', 'mine', ownerId] });
    },
  });
}
