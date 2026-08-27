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

export function diaKeyPara(fecha: Date) {
  return DIAS_POR_INDICE[fecha.getDay()];
}

const DURACION_TURNO_MIN = 30;

export function generarSlots(horarios: BusinessHours, dia: Date, ocupados: string[]): Date[] {
  const horarioDia = horarios[diaKeyPara(dia)];
  if (!horarioDia) return [];

  const [horaAbre, minAbre] = horarioDia.abre.split(':').map(Number);
  const [horaCierra, minCierra] = horarioDia.cierra.split(':').map(Number);

  const ocupadosSet = new Set(ocupados);
  const ahora = new Date();
  const slots: Date[] = [];

  const cursor = new Date(dia);
  cursor.setHours(horaAbre, minAbre, 0, 0);
  const cierre = new Date(dia);
  cierre.setHours(horaCierra, minCierra, 0, 0);

  while (cursor < cierre) {
    if (cursor > ahora && !ocupadosSet.has(cursor.toISOString())) {
      slots.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + DURACION_TURNO_MIN);
  }

  return slots;
}

export function proximosDias(cantidad = 7): Date[] {
  return Array.from({ length: cantidad }, (_, i) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + i);
    fecha.setHours(0, 0, 0, 0);
    return fecha;
  });
}
