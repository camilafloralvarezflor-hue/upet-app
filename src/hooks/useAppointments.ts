import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { useSession } from '../lib/auth-context';
import type { Appointment, AppointmentStatus } from '../lib/database.types';
import { sendPushNotification } from '../lib/push-notifications';
import { COMISION_PLATAFORMA_PCT } from '../lib/comision';

async function fetchPushToken(userId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_push_token', { p_user_id: userId });
  if (error) return null;
  return data;
}

export type AppointmentWithDetalle = Appointment & {
  pets: { nombre: string } | null;
  profiles: { nombre: string } | null;
};

export type AppointmentWithNegocio = Appointment & {
  pets: { nombre: string } | null;
  businesses: { nombre: string; owner_id: string } | null;
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
          'Tenés una nueva solicitud de turno en Mawis.'
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
        sendPushNotification(token, PUSH_ESTADO_META[estado].titulo, PUSH_ESTADO_META[estado].cuerpo);
      }
    },
  });
}

const PUSH_ESTADO_META: Record<AppointmentStatus, { titulo: string; cuerpo: string }> = {
  pendiente: { titulo: 'Turno pendiente', cuerpo: 'Tu turno quedó pendiente de confirmación.' },
  confirmado: { titulo: 'Turno confirmado', cuerpo: 'El prestador confirmó tu turno.' },
  en_curso: { titulo: '¡Tu paseo empezó!', cuerpo: 'Podés seguir el recorrido en vivo desde el turno.' },
  completado: { titulo: 'Paseo finalizado', cuerpo: 'El servicio terminó. Ya podés dejar tu reseña.' },
  cancelado: { titulo: 'Turno cancelado', cuerpo: 'El prestador canceló tu turno.' },
};

export interface FinalizarServicioInput {
  appointmentId: string;
  monto: number;
}

export function useFinalizarServicio(businessId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, monto }: FinalizarServicioInput) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          estado: 'completado',
          monto,
          comision_pct: COMISION_PLATAFORMA_PCT,
          pagado: true,
        })
        .eq('id', appointmentId)
        .select()
        .single();
      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: async (updated) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', businessId] });

      const token = await fetchPushToken(updated.owner_id);
      if (token) {
        sendPushNotification(
          token,
          PUSH_ESTADO_META.completado.titulo,
          PUSH_ESTADO_META.completado.cuerpo
        );
      }
    },
  });
}

async function fetchAppointment(id: string): Promise<AppointmentWithNegocio> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, pets(nombre), businesses(nombre, owner_id), profiles(nombre)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as AppointmentWithNegocio;
}

export function useAppointment(id: string | undefined) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => fetchAppointment(id as string),
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.estado === 'en_curso' ? 15000 : false,
  });
}

async function fetchMyAppointments(ownerId: string): Promise<AppointmentWithNegocio[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, pets(nombre), businesses(nombre, owner_id), profiles(nombre)')
    .eq('owner_id', ownerId)
    .order('fecha_hora', { ascending: false });
  if (error) throw error;
  return data as unknown as AppointmentWithNegocio[];
}

export function useMyAppointments() {
  const { session } = useSession();
  const ownerId = session?.user.id;

  return useQuery({
    queryKey: ['appointments', 'mine', ownerId],
    queryFn: () => fetchMyAppointments(ownerId as string),
    enabled: !!ownerId,
  });
}

function generarCodigoCheckin() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const parte = (n: number) =>
    Array.from({ length: n }, () => alfabeto[Math.floor(Math.random() * alfabeto.length)]).join('');
  return `MW-${parte(4)}-${parte(2)}`;
}

/** Lado paseador: genera (o reusa) el código de check-in de este turno. */
export function useIniciarCheckin(appointmentId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!appointmentId) throw new Error('Falta el turno.');
      const { data: actual, error: errorLectura } = await supabase
        .from('appointments')
        .select('codigo_checkin')
        .eq('id', appointmentId)
        .single();
      if (errorLectura) throw errorLectura;
      if (actual.codigo_checkin) return actual.codigo_checkin as string;

      const codigo = generarCodigoCheckin();
      const { error } = await supabase
        .from('appointments')
        .update({ codigo_checkin: codigo })
        .eq('id', appointmentId);
      if (error) throw error;
      return codigo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment', appointmentId] });
    },
  });
}

/** Lado dueño: valida el código escaneado y arranca el paseo. */
export function useConfirmarCheckin(appointmentId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (codigoEscaneado: string) => {
      if (!appointmentId) throw new Error('Falta el turno.');
      const { data: turno, error: errorLectura } = await supabase
        .from('appointments')
        .select('codigo_checkin, estado')
        .eq('id', appointmentId)
        .single();
      if (errorLectura) throw errorLectura;
      if (turno.estado !== 'confirmado') throw new Error('Este turno no está listo para arrancar.');
      if (turno.codigo_checkin !== codigoEscaneado) throw new Error('El código no coincide.');

      const { error } = await supabase
        .from('appointments')
        .update({ estado: 'en_curso', checkin_en: new Date().toISOString() })
        .eq('id', appointmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment', appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/** Lado paseador: los turnos que comparten un mismo paseo grupal. */
export function useAppointmentsGrupo(grupoId: string | undefined) {
  return useQuery({
    queryKey: ['appointments', 'grupo', grupoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, pets(nombre)')
        .eq('grupo_id', grupoId as string)
        .order('fecha_hora', { ascending: true });
      if (error) throw error;
      return data as unknown as AppointmentWithDetalle[];
    },
    enabled: !!grupoId,
  });
}

/** Lado paseador: arranca de una todos los turnos de un paseo grupal. */
export function useIniciarRondaGrupal(businessId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentIds: string[]) => {
      const { error } = await supabase
        .from('appointments')
        .update({ estado: 'en_curso' })
        .in('id', appointmentIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', businessId] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'grupo'] });
    },
  });
}
