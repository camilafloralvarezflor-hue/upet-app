export interface Rubro {
  value: string;
  label: string;
  labelPlural: string;
}

export const RUBROS: Rubro[] = [
  { value: 'veterinaria', label: 'Veterinaria', labelPlural: 'Veterinarias' },
  { value: 'paseador', label: 'Paseador', labelPlural: 'Paseadores' },
  { value: 'peluqueria', label: 'Peluquería', labelPlural: 'Peluquerías' },
  { value: 'petshop', label: 'Petshop', labelPlural: 'Petshops' },
  { value: 'cuidador', label: 'Cuidador', labelPlural: 'Cuidadores' },
];

export function rubroLabel(value: string) {
  return RUBROS.find((r) => r.value === value)?.label ?? value;
}
