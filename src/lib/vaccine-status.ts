import type { VaccineStatus } from './database.types';

const DIAS_AVISO_PROXIMA = 30;

export function computeVaccineStatus(proximaFecha: string | null): VaccineStatus {
  if (!proximaFecha) return 'al_dia';

  const hoy = new Date();
  const proxima = new Date(proximaFecha);
  const diasRestantes = Math.ceil((proxima.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0) return 'vencida';
  if (diasRestantes <= DIAS_AVISO_PROXIMA) return 'proxima';
  return 'al_dia';
}

const MESES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

export function formatFechaEs(fecha: string) {
  const date = new Date(`${fecha}T00:00:00`);
  return `${date.getDate()} ${MESES[date.getMonth()]} ${date.getFullYear()}`;
}

export function diasHasta(fecha: string) {
  const hoy = new Date();
  const objetivo = new Date(`${fecha}T00:00:00`);
  return Math.ceil((objetivo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}
