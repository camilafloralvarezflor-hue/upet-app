import { useQuery } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { Business } from '../lib/database.types';

async function fetchBusinesses(): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('boost_activo', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export function useBusinesses() {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses,
  });
}

async function fetchBusiness(id: string): Promise<Business> {
  const { data, error } = await supabase.from('businesses').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export function useBusinessDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['business', id],
    queryFn: () => fetchBusiness(id as string),
    enabled: !!id,
  });
}
