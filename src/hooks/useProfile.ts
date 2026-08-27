import { useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/database.types';
import { useSession } from '../lib/auth-context';

// telefono y expo_push_token no son de lectura pública (ver migración 0010),
// así que este hook solo puede traer las columnas públicas del perfil.
export type PublicProfile = Omit<Profile, 'telefono' | 'expo_push_token'>;

async function fetchProfile(userId: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, nombre, avatar_url, created_at, updated_at')
    .eq('id', userId)
    .single();

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
