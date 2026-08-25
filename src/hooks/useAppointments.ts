import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { useSession } from '../lib/auth-context';
import type { Appointment, AppointmentStatus } from '../lib/database.types';
import { sendPushNotification } from '../lib/push-notifications';

async function fetchPushToken(userId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_push_token', { p_user_id: userId });
  if (error) return null;
  return data;
}

export type AppointmentWithDetalle = Appointment & {
  pets: { nombre: string } | null;
  profiles: { nombre: string } | null;
};

function rangoDelDia(dia: Date) {
  const inicio = new Date(dia);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(dia);
  fin.setHours(23, 59, 59, 999);
  return { inicio: inicio.toISOString(), fin: fin.toISOString() };
}

async function fetchAppointmentsForBusiness(
  businessId: string,
  dia: Date
): Promise<AppointmentWithDetalle[]> {
  const { inicio, fin } = rangoDelDia(dia);
  const { data, error } = await supabase
    .from('appointments')
    .select('*, pets(nombre), profiles(nombre)')
    .eq('business_id', businessId)
    .gte('fecha_hora', inicio)
    .lte('fecha_hora', fin)
    .order('fecha_hora', { ascending: true });

  if (error) throw error;
  return data as unknown as AppointmentWithDetalle[];
}

export function useAppointmentsForBusiness(businessId: string | undefined, dia: Date) {
  return useQuery({
    queryKey: ['appointments', businessId, dia.toDateString()],
    queryFn: () => fetchAppointmentsForBusiness(businessId as string, dia),
    enabled: !!businessId,
  });
}

async function fetchBookedSlots(businessId: string, dia: Date): Promise<string[]> {
  const diaStr = dia.toISOString().slice(0, 10);
  const { data, error } = await supabase.rpc('get_booked_slots', {
    p_business_id: businessId,
    p_day: diaStr,
  });
  if (error) throw error;
  return (data as { fecha_hora: string }[]).map((r) => new Date(r.fecha_hora).toISOString());
}

export function useBookedSlots(businessId: string | undefined, dia: Date) {
  return useQuery({
    queryKey: ['appointments', 'booked-slots', businessId, dia.toDateString()],
    queryFn: () => fetchBookedSlots(businessId as string, dia),
    enabled: !!businessId,
  });
}

export interface CreateAppointmentInput {
  businessId: string;
  petId: string;
  fechaHora: Date;
  tipoServicio: string;
}

export function useCreateAppointment() {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAppointmentInput) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          business_id: input.businessId,
          pet_id: input.petId,
          owner_id: session?.user.id,
          fecha_hora: input.fechaHora.toISOString(),
          estado: 'pendiente',
          tipo_servicio: input.tipoServicio || null,
        })
        .select('*, businesses(nombre, owner_id)')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (appointment) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });

      const businessOwnerId = (appointment as { businesses: { owner_id: string } | null })
        .businesses?.owner_id;
      if (!businessOwnerId) return;

      const token = await fetchPushToken(businessOwnerId);
      if (token) {
        sendPushNotification(
          token,
          'Nuevo turno solicitado',
          'Tenés una nueva solicitud de turno en UPET.'
        );
      }
    },
  });
}

export function useUpdateAppointmentStatus(businessId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      estado,
    }: {
      appointmentId: string;
      estado: AppointmentStatus;
    }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ estado })
        .eq('id', appointmentId)
        .select()
        .single();
      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: async (updated, { estado }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', businessId] });

      const token = await fetchPushToken(updated.owner_id);
      if (token) {
        sendPushNotification(
          token,
          estado === 'confirmado' ? 'Turno confirmado' : 'Turno cancelado',
          estado === 'confirmado'
            ? 'La empresa confirmó tu turno.'
            : 'La empresa canceló tu turno.'
        );
      }
    },
  });
}
