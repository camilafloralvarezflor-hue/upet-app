import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

import { supabase } from './supabase';

export async function uploadPetPhoto(ownerId: string, petId: string, localUri: string) {
  const extension = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${ownerId}/${petId}.${extension}`;

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { error } = await supabase.storage.from('pets').upload(path, decode(base64), {
    contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from('pets').getPublicUrl(path);
  return `${data.publicUrl}?updated=${Date.now()}`;
}
