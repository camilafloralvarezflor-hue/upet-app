import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Button } from './Button';
import { TextField } from './TextField';
import { MutedText } from './Typography';
import { colors, spacing } from '../theme/tokens';
import type { VaccineInput } from '../hooks/useVaccines';
import type { Vaccine } from '../lib/database.types';

interface VaccineFormProps {
  initialValues?: Pick<Vaccine, 'nombre' | 'fecha_aplicacion' | 'proxima_fecha'>;
  submitLabel: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (values: VaccineInput) => void;
}

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function VaccineForm({ initialValues, submitLabel, loading, error, onSubmit }: VaccineFormProps) {
  const [nombre, setNombre] = useState(initialValues?.nombre ?? '');
  const [fechaAplicacion, setFechaAplicacion] = useState(initialValues?.fecha_aplicacion ?? '');
  const [proximaFecha, setProximaFecha] = useState(initialValues?.proxima_fecha ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!nombre.trim() || !FECHA_REGEX.test(fechaAplicacion)) {
      setValidationError('Completá el nombre y la fecha de aplicación (AAAA-MM-DD).');
      return;
    }
    if (proximaFecha && !FECHA_REGEX.test(proximaFecha)) {
      setValidationError('La próxima fecha debe tener el formato AAAA-MM-DD.');
      return;
    }
    setValidationError(null);
    onSubmit({
      nombre: nombre.trim(),
      fecha_aplicacion: fechaAplicacion,
      proxima_fecha: proximaFecha || null,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TextField label="Nombre de la vacuna" value={nombre} onChangeText={setNombre} placeholder="Antirrábica" />
      <TextField
        label="Fecha de aplicación (AAAA-MM-DD)"
        value={fechaAplicacion}
        onChangeText={setFechaAplicacion}
        placeholder="2026-03-14"
        keyboardType="numbers-and-punctuation"
      />
      <TextField
        label="Próxima fecha (opcional, AAAA-MM-DD)"
        value={proximaFecha}
        onChangeText={setProximaFecha}
        placeholder="2027-03-14"
        keyboardType="numbers-and-punctuation"
      />

      {(validationError || error) && (
        <MutedText style={styles.error}>{validationError ?? error}</MutedText>
      )}

      <Button
        label={loading ? 'Guardando…' : submitLabel}
        onPress={handleSubmit}
        disabled={loading}
        style={styles.submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  error: {
    color: colors.danger,
  },
  submit: {
    marginTop: spacing.sm,
  },
});
