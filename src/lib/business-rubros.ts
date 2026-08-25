export interface Rubro {
  value: string;
  label: string;
}

export const RUBROS: Rubro[] = [
  { value: 'veterinaria', label: 'Veterinaria' },
  { value: 'paseador', label: 'Paseador' },
  { value: 'peluqueria', label: 'Peluquería' },
  { value: 'petshop', label: 'Petshop' },
  { value: 'cuidador', label: 'Cuidador' },
];

export function rubroLabel(value: string) {
  return RUBROS.find((r) => r.value === value)?.label ?? value;
}
