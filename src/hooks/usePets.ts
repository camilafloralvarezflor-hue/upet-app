import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { useSession } from '../lib/auth-context';
import type { Pet } from '../lib/database.types';

export type PetInput = Omit<
  Pet,
  'id' | 'owner_id' | 'created_at' | 'updated_at' | 'tamano' | 'temperamento'
> &
  Partial<Pick<Pet, 'tamano' | 'temperamento'>>;

async function fetchPets(ownerId: string): Promise<Pet[]> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

async function fetchPet(id: string): Promise<Pet> {
  const { data, error } = await supabase.from('pets').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export function usePets() {
  const { session } = useSession();
  const ownerId = session?.user.id;

  return useQuery({
    queryKey: ['pets', ownerId],
    queryFn: () => fetchPets(ownerId as string),
    enabled: !!ownerId,
  });
}

export function usePet(id: string | undefined) {
  return useQuery({
    queryKey: ['pet', id],
    queryFn: () => fetchPet(id as string),
    enabled: !!id,
  });
}

export function useCreatePet() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const ownerId = session?.user.id as string;

  return useMutation({
    mutationFn: async (input: PetInput) => {
      const { data, error } = await supabase
        .from('pets')
        .insert({ ...input, owner_id: ownerId })
        .select()
        .single();
      if (error) throw error;
      return data as Pet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', ownerId] });
    },
  });
}

export function useUpdatePet(id: string) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const ownerId = session?.user.id;

  return useMutation({
    mutationFn: async (input: Partial<PetInput>) => {
      const { data, error } = await supabase
        .from('pets')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Pet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', ownerId] });
      queryClient.invalidateQueries({ queryKey: ['pet', id] });
    },
  });
}

export function useDeletePet() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const ownerId = session?.user.id;

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', ownerId] });
    },
  });
}
