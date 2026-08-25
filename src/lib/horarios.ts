import type { BusinessHours } from './database.types';

export const DIAS_SEMANA = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
] as const;

export function defaultHorarios(): BusinessHours {
  return {
    lunes: { abre: '09:00', cierra: '19:00' },
    martes: { abre: '09:00', cierra: '19:00' },
    miercoles: { abre: '09:00', cierra: '19:00' },
    jueves: { abre: '09:00', cierra: '19:00' },
    viernes: { abre: '09:00', cierra: '19:00' },
    sabado: null,
    domingo: null,
  };
}
