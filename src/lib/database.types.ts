export type UserRole = 'dueno' | 'empresa';
export type VaccineStatus = 'al_dia' | 'proxima' | 'vencida';
export type AppointmentStatus = 'pendiente' | 'confirmado' | 'cancelado';

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
  created_at: string;
  updated_at: string;
}

export type BusinessEventType = 'vista' | 'contacto';

export interface BusinessEvent {
  id: string;
  business_id: string;
  tipo: BusinessEventType;
  created_at: string;
}
