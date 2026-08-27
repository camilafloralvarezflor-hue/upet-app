import { useQuery } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { EmergencyContact } from '../lib/database.types';

async function fetchEmergencyContacts(): Promise<EmergencyContact[]> {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) throw error;
  return data;
}

export function useEmergencyContacts() {
  return useQuery({
    queryKey: ['emergency_contacts'],
    queryFn: fetchEmergencyContacts,
  });
}
