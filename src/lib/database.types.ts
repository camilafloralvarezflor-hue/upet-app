export type UserRole = 'dueno' | 'empresa';
export type VaccineStatus = 'al_dia' | 'proxima' | 'vencida';
export type AppointmentStatus =
  | 'pendiente'
  | 'confirmado'
  | 'en_curso'
  | 'completado'
  | 'cancelado';
export type PetTamano = 'chico' | 'mediano' | 'grande';
export type PetTemperamento =
  | 'sociable'
  | 'tira_correa'
  | 'miedo_bicis'
  | 'no_gatos'
  | 'necesita_bozal';
export type VerificacionTipo = 'dni' | 'selfie' | 'antecedentes' | 'primeros_auxilios';
export type VerificacionEstado = 'pendiente' | 'en_revision' | 'validado' | 'rechazado';
export type PayoutEstado = 'solicitado' | 'procesado' | 'rechazado';

export interface Profile {
  id: string;
  role: UserRole;
  nombre: string;
  telefono: string | null;
  avatar_url: string | null;
  expo_push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  nombre: string;
  especie: string;
  raza: string | null;
  edad: number | null;
  peso: number | null;
  foto_url: string | null;
  condiciones_medicas: string | null;
  tamano: PetTamano | null;
  temperamento: PetTemperamento[];
  created_at: string;
  updated_at: string;
}

export interface Vaccine {
  id: string;
  pet_id: string;
  nombre: string;
  fecha_aplicacion: string;
  proxima_fecha: string | null;
  estado: VaccineStatus;
  created_at: string;
}

export interface BusinessHours {
  [dia: string]: { abre: string; cierra: string } | null;
}

export interface Business {
  id: string;
  owner_id: string;
  rubro: string;
  nombre: string;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  horarios: BusinessHours;
  fotos: string[];
  servicios: string[];
  telefono: string | null;
  turnos_habilitado: boolean;
  verificado: boolean;
  boost_activo: boolean;
  boost_vence: string | null;
  cbu_alias: string | null;
  disponibilidad: { mananas: boolean; tardes: boolean; finde: boolean };
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  owner_id: string;
  calificacion: number;
  comentario: string | null;
  respuesta_empresa: string | null;
  vinculada_a_visita: boolean;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  horario_guardia: string | null;
  especialidad: string | null;
  verificado_en: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  pet_id: string;
  owner_id: string;
  fecha_hora: string;
  estado: AppointmentStatus;
  tipo_servicio: string | null;
  requiere_seguimiento: boolean;
  monto: number | null;
  comision_pct: number | null;
  pagado: boolean;
  grupo_id: string | null;
  codigo_checkin: string | null;
  checkin_en: string | null;
  created_at: string;
  updated_at: string;
}

export interface WalkLocation {
  id: string;
  appointment_id: string;
  lat: number;
  lng: number;
  recorded_at: string;
}

export type BusinessEventType = 'vista' | 'contacto';

export interface BusinessEvent {
  id: string;
  business_id: string;
  tipo: BusinessEventType;
  created_at: string;
}

export interface Message {
  id: string;
  appointment_id: string;
  sender_id: string;
  texto: string | null;
  foto_url: string | null;
  created_at: string;
}

export interface WalkerVerification {
  id: string;
  business_id: string;
  tipo: VerificacionTipo;
  estado: VerificacionEstado;
  archivo_url: string | null;
  validado_en: string | null;
  created_at: string;
}

export interface PayoutRequest {
  id: string;
  business_id: string;
  monto: number;
  estado: PayoutEstado;
  created_at: string;
}
