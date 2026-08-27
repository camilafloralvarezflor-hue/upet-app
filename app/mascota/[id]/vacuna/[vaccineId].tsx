import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../../../src/components/Button';
import { Screen } from '../../../../src/components/Screen';
import { Heading2, MutedText } from '../../../../src/components/Typography';
import { VaccineForm } from '../../../../src/components/VaccineForm';
import { useDeleteVaccine, useUpdateVaccine, useVaccines } from '../../../../src/hooks/useVaccines';
import { colors, spacing } from '../../../../src/theme/tokens';

export default function EditarVacunaScreen() {
  const router = useRouter();
  const { id, vaccineId } = useLocalSearchParams<{ id: string; vaccineId: string }>();
  const { data: vaccines, isLoading } = useVaccines(id);
  const vaccine = vaccines?.find((v) => v.id === vaccineId);
  const updateVaccine = useUpdateVaccine(id, vaccineId);
  const deleteVaccine = useDeleteVaccine(id);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit: React.ComponentProps<typeof VaccineForm>['onSubmit'] = async (values) => {
    setSaving(true);
    setError(null);
    try {
      await updateVaccine.mutateAsync(values);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar vacuna', '¿Seguro que querés eliminar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteVaccine.mutateAsync(vaccineId);
          router.back();
        },
      },
    ]);
  };

  if (isLoading || !vaccine) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <MutedText>‹ Volver</MutedText>
      </Pressable>
      <Heading2 style={styles.title}>Editar vacuna</Heading2>
      <VaccineForm
        initialValues={vaccine}
        submitLabel="Guardar cambios"
        loading={saving}
        error={error}
        onSubmit={handleSubmit}
      />
      <Button label="Eliminar vacuna" variant="danger" onPress={handleDelete} style={styles.deleteButton} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  loading: {
    marginTop: spacing.xl,
  },
  deleteButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
