import type { BusinessHours } from './database.types';

const DIAS_POR_INDICE = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
] as const;

export interface EstadoHorario {
  abierto: boolean;
  label: string;
}

export function computeEstadoHorario(horarios: BusinessHours, ahora = new Date()): EstadoHorario {
  const dia = DIAS_POR_INDICE[ahora.getDay()];
  const horarioHoy = horarios[dia];

  if (!horarioHoy) {
    return { abierto: false, label: 'Cerrado hoy' };
  }

  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const [horaAbre, minAbre] = horarioHoy.abre.split(':').map(Number);
  const [horaCierra, minCierra] = horarioHoy.cierra.split(':').map(Number);
  const minutosAbre = horaAbre * 60 + minAbre;
  const minutosCierra = horaCierra * 60 + minCierra;

  if (minutosAhora >= minutosAbre && minutosAhora < minutosCierra) {
    return { abierto: true, label: `Abierto ahora · Cierra ${horarioHoy.cierra}` };
  }

  if (minutosAhora < minutosAbre) {
    return { abierto: false, label: `Abre hoy a las ${horarioHoy.abre}` };
  }

  return { abierto: false, label: 'Cerrado' };
}
