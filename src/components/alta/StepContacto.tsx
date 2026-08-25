import { StyleSheet, View } from 'react-native';

import { TextField } from '../TextField';
import { MutedText } from '../Typography';
import { spacing } from '../../theme/tokens';
import type { AltaFormState } from './types';

interface StepContactoProps {
  form: AltaFormState;
  onChange: (patch: Partial<AltaFormState>) => void;
}

export function StepContacto({ form, onChange }: StepContactoProps) {
  return (
    <View style={styles.content}>
      <MutedText>
        Este es el teléfono que vamos a mostrar a los dueños de mascotas para que te contacten.
      </MutedText>
      <TextField
        label="Teléfono de contacto"
        value={form.telefono}
        onChangeText={(telefono) => onChange({ telefono })}
        placeholder="+54 9 ..."
        keyboardType="phone-pad"
      />
      <TextField
        label="Servicios que ofrecés (opcional, separados por coma)"
        value={form.servicios}
        onChangeText={(servicios) => onChange({ servicios })}
        placeholder="Consultas, Vacunación, Cirugías"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
});
