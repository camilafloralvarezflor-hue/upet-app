import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '../../../../src/components/Screen';
import { Heading2, MutedText } from '../../../../src/components/Typography';
import { VaccineForm } from '../../../../src/components/VaccineForm';
import { useCreateVaccine } from '../../../../src/hooks/useVaccines';
import { spacing } from '../../../../src/theme/tokens';

export default function NuevaVacunaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const createVaccine = useCreateVaccine(id);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit: React.ComponentProps<typeof VaccineForm>['onSubmit'] = async (values) => {
    setSaving(true);
    setError(null);
    try {
      await createVaccine.mutateAsync(values);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar la vacuna.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <MutedText>‹ Volver</MutedText>
      </Pressable>
      <Heading2 style={styles.title}>Agregar vacuna</Heading2>
      <VaccineForm submitLabel="Guardar vacuna" loading={saving} error={error} onSubmit={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
