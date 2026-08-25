import type { BusinessHours } from '../../lib/database.types';

export interface AltaFormState {
  rubro: string | null;
  nombre: string;
  direccion: string;
  horarios: BusinessHours;
  turnosHabilitado: boolean;
  fotosLocales: string[];
  telefono: string;
}
