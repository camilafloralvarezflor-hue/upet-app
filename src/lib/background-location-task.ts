import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from './supabase';

export const WALK_LOCATION_TASK = 'mawis-walk-location-task';
const TRACKING_APPOINTMENT_KEY = 'mawis:tracking-appointment-id';

// defineTask se ejecuta a nivel de módulo (se importa una sola vez, bien
// arriba en app/_layout.tsx) para que quede registrada ANTES de que el SO
// pueda relanzar la app en segundo plano y disparar un evento de ubicación.
TaskManager.defineTask(WALK_LOCATION_TASK, async ({ data, error }) => {
  if (error) return;

  const { locations } = (data as { locations: Location.LocationObject[] }) ?? {};
  const ultima = locations?.[locations.length - 1];
  if (!ultima) return;

  const appointmentId = await AsyncStorage.getItem(TRACKING_APPOINTMENT_KEY);
  if (!appointmentId) return;

  await supabase.from('walk_locations').insert({
    appointment_id: appointmentId,
    lat: ultima.coords.latitude,
    lng: ultima.coords.longitude,
  });
});

export type IniciarTrackingResultado =
  | { ok: true }
  | { ok: false; motivo: 'foreground_denegado' | 'background_denegado' };

/**
 * Arranca la publicación de ubicación en segundo plano para un turno. Una
 * vez iniciada, sigue funcionando aunque el paseador minimice la app o
 * bloquee el celular — no depende de que ninguna pantalla siga montada.
 *
 * Requiere un development build (EAS) o `expo run:ios`/`run:android`: no
 * funciona desde la app de Expo Go.
 */
export async function iniciarTrackingEnSegundoPlano(
  appointmentId: string
): Promise<IniciarTrackingResultado> {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') {
    return { ok: false, motivo: 'foreground_denegado' };
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status !== 'granted') {
    return { ok: false, motivo: 'background_denegado' };
  }

  const yaActivo = await Location.hasStartedLocationUpdatesAsync(WALK_LOCATION_TASK);
  if (yaActivo) {
    await Location.stopLocationUpdatesAsync(WALK_LOCATION_TASK);
  }

  await AsyncStorage.setItem(TRACKING_APPOINTMENT_KEY, appointmentId);

  await Location.startLocationUpdatesAsync(WALK_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 8000,
    distanceInterval: 15,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Mawis está compartiendo tu ubicación',
      notificationBody: 'Se actualiza mientras el paseo sigue en curso.',
    },
  });

  return { ok: true };
}

export async function detenerTrackingEnSegundoPlano() {
  const activo = await Location.hasStartedLocationUpdatesAsync(WALK_LOCATION_TASK);
  if (activo) {
    await Location.stopLocationUpdatesAsync(WALK_LOCATION_TASK);
  }
  await AsyncStorage.removeItem(TRACKING_APPOINTMENT_KEY);
}

export async function estaTrackingActivo() {
  return Location.hasStartedLocationUpdatesAsync(WALK_LOCATION_TASK);
}
