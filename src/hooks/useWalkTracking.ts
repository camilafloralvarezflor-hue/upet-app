import { useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';
import type { WalkLocation } from '../lib/database.types';
import { estaTrackingActivo } from '../lib/background-location-task';

/**
 * Lado paseador: solo consulta si el tracking en segundo plano sigue activo
 * en este dispositivo. Arrancar/parar la publicación real vive en
 * `iniciarTrackingEnSegundoPlano` / `detenerTrackingEnSegundoPlano`
 * (background-location-task.ts), disparado desde las acciones de "Iniciar
 * paseo" / "Finalizar paseo" — no depende de que esta pantalla siga montada.
 */
export function useTrackingActivoLocal() {
  const [activo, setActivo] = useState<boolean | null>(null);

  useEffect(() => {
    let vivo = true;
    estaTrackingActivo().then((valor) => {
      if (vivo) setActivo(valor);
    });
    return () => {
      vivo = false;
    };
  }, []);

  return activo;
}

/**
 * Lado dueño: trae el recorrido ya registrado y se suscribe a Realtime para
 * ir sumando cada posición nueva mientras el paseo sigue en curso.
 */
export function useWalkTrail(appointmentId: string | undefined) {
  const [puntos, setPuntos] = useState<WalkLocation[]>([]);

  useEffect(() => {
    if (!appointmentId) return;

    let activo = true;

    supabase
      .from('walk_locations')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('recorded_at', { ascending: true })
      .then(({ data }) => {
        if (activo && data) setPuntos(data);
      });

    const channel = supabase
      .channel(`walk_locations:${appointmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'walk_locations',
          filter: `appointment_id=eq.${appointmentId}`,
        },
        (payload) => {
          setPuntos((actual) => [...actual, payload.new as WalkLocation]);
        }
      )
      .subscribe();

    return () => {
      activo = false;
      supabase.removeChannel(channel);
    };
  }, [appointmentId]);

  return puntos;
}
