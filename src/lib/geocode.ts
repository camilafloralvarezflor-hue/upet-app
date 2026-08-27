import * as Location from 'expo-location';

export async function geocodeAddress(direccion: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const results = await Location.geocodeAsync(direccion);
    const first = results[0];
    if (!first) return null;
    return { lat: first.latitude, lng: first.longitude };
  } catch {
    return null;
  }
}
