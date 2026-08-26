import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

import { supabase } from '../lib/supabase';
import type { WalkLocation } from '../lib/database.types';

const INTERVALO_MS = 8000;
const DISTANCIA_MIN_METROS = 15;

/**
 * Lado paseador: mientras `activo` es true (el turno está en_curso y esta
 * pantalla sigue abierta), pide permiso de ubicación en foreground y publica
 * la posición a walk_locations cada pocos segundos. Al dejar de estar activo
 * (paseo finalizado/cancelado, o se sale de la pantalla) corta el tracking.
 *
 * Alcance: solo foreground. Si el paseador manda la app a segundo plano se
 * corta la publicación — habilitar tracking en background requeriría
 * permisos adicionales (expo-location background + TaskManager) que no
 * están activados en este MVP.
 */
export function useWalkLocationPublisher(appointmentId: string, activo: boolean) {
  const [compartiendo, setCompartiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!activo) {
      watcherRef.current?.remove();
      watcherRef.current = null;
      setCompartiendo(false);
      return;
    }

    let cancelado = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Necesitamos tu ubicación para compartir el recorrido con el dueño.');
        return;
      }

      const watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: INTERVALO_MS,
          distanceInterval: DISTANCIA_MIN_METROS,
        },
        (position) => {
          supabase.from('walk_locations').insert({
            appointment_id: appointmentId,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      );

      if (cancelado) {
        watcher.remove();
        return;
      }
      watcherRef.current = watcher;
      setCompartiendo(true);
    })();

    return () => {
      cancelado = true;
      watcherRef.current?.remove();
      watcherRef.current = null;
    };
  }, [activo, appointmentId]);

  return { compartiendo, error };
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
