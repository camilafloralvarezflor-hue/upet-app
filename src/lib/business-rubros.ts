export interface Rubro {
  value: string;
  label: string;
  labelPlural: string;
  // Fase actual de Mawis: solo paseo y cuidado. Los demás rubros quedan en el
  // modelo de datos para una fase futura, pero no se muestran como opción.
  activo: boolean;
}

export const RUBROS: Rubro[] = [
  { value: 'paseador', label: 'Paseador', labelPlural: 'Paseadores', activo: true },
  { value: 'cuidador', label: 'Cuidador', labelPlural: 'Cuidadores', activo: true },
  { value: 'veterinaria', label: 'Veterinaria', labelPlural: 'Veterinarias', activo: false },
  { value: 'peluqueria', label: 'Peluquería', labelPlural: 'Peluquerías', activo: false },
  { value: 'petshop', label: 'Petshop', labelPlural: 'Petshops', activo: false },
];

export const RUBROS_ACTIVOS = RUBROS.filter((r) => r.activo);

export function rubroLabel(value: string) {
  return RUBROS.find((r) => r.value === value)?.label ?? value;
}
