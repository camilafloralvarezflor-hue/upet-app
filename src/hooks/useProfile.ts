import { useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/database.types';
import { useSession } from '../lib/auth-context';

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export function useProfile() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId as string),
    enabled: !!userId,
  });
}

export function useInvalidateProfile() {
  const queryClient = useQueryClient();
  return (userId: string) => queryClient.invalidateQueries({ queryKey: ['profile', userId] });
}
