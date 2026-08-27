import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { useSession } from '../lib/auth-context';
import type { Message } from '../lib/database.types';

export function useMessages(appointmentId: string | undefined) {
  const [mensajes, setMensajes] = useState<Message[]>([]);

  useEffect(() => {
    if (!appointmentId) return;

    let activo = true;

    supabase
      .from('messages')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (activo && data) setMensajes(data);
      });

    const channel = supabase
      .channel(`messages:${appointmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `appointment_id=eq.${appointmentId}`,
        },
        (payload) => {
          setMensajes((actual) => [...actual, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      activo = false;
      supabase.removeChannel(channel);
    };
  }, [appointmentId]);

  return mensajes;
}

export function useSendMessage(appointmentId: string | undefined) {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (texto: string) => {
      if (!appointmentId || !session?.user.id) throw new Error('Falta el turno o la sesión.');
      const { error } = await supabase.from('messages').insert({
        appointment_id: appointmentId,
        sender_id: session.user.id,
        texto,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment', appointmentId] });
    },
  });
}
