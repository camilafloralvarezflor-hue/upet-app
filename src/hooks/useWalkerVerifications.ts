import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { uploadVerificationPhoto } from '../lib/storage';
import type { VerificacionTipo, WalkerVerification } from '../lib/database.types';

async function fetchVerifications(businessId: string): Promise<WalkerVerification[]> {
  const { data, error } = await supabase
    .from('walker_verifications')
    .select('*')
    .eq('business_id', businessId);
  if (error) throw error;
  return data;
}

export function useWalkerVerifications(businessId: string | undefined) {
  return useQuery({
    queryKey: ['walker_verifications', businessId],
    queryFn: () => fetchVerifications(businessId as string),
    enabled: !!businessId,
  });
}

/** Elige una foto de la galería y la sube como documento de verificación (queda "en revisión"). */
export function useSubirDocumentoVerificacion(businessId: string | undefined, ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tipo: VerificacionTipo) => {
      if (!businessId || !ownerId) throw new Error('Falta la sesión.');

      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) throw new Error('Necesitamos acceso a tus fotos.');

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (resultado.canceled || !resultado.assets[0]) return null;

      const path = await uploadVerificationPhoto(ownerId, tipo, resultado.assets[0].uri);

      const { error } = await supabase.from('walker_verifications').upsert(
        {
          business_id: businessId,
          tipo,
          estado: 'en_revision',
          archivo_url: path,
        },
        { onConflict: 'business_id,tipo' }
      );
      if (error) throw error;
      return path;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walker_verifications', businessId] });
    },
  });
}
