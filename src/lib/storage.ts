import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

import { supabase } from './supabase';

async function uploadToBucket(bucket: string, path: string, localUri: string) {
  const extension = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const fullPath = `${path}.${extension}`;

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { error } = await supabase.storage.from(bucket).upload(fullPath, decode(base64), {
    contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
  return `${data.publicUrl}?updated=${Date.now()}`;
}

export function uploadPetPhoto(ownerId: string, petId: string, localUri: string) {
  return uploadToBucket('pets', `${ownerId}/${petId}`, localUri);
}

export function uploadBusinessPhoto(
  ownerId: string,
  businessId: string,
  index: number,
  localUri: string
) {
  return uploadToBucket('businesses', `${ownerId}/${businessId}/${index}`, localUri);
}
