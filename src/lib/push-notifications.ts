import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { supabase } from './supabase';

export async function registerForPushNotificationsAsync(userId: string) {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;

    if (existing !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }

    if (status !== 'granted') return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );

    await supabase.from('profiles').update({ expo_push_token: token }).eq('id', userId);
  } catch {
    // Sin permiso, sin projectId de EAS, o sin conexión: no bloquea el resto de la app.
  }
}

export async function sendPushNotification(expoPushToken: string, title: string, body: string) {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: expoPushToken, title, body }),
    });
  } catch {
    // Best-effort: si falla el envío, no interrumpe la acción principal del usuario.
  }
}
