import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../../src/components/Button';
import { PetForm } from '../../../src/components/PetForm';
import { Screen } from '../../../src/components/Screen';
import { Heading2, MutedText } from '../../../src/components/Typography';
import { useDeletePet, usePet, useUpdatePet } from '../../../src/hooks/usePets';
import { useSession } from '../../../src/lib/auth-context';
import { uploadPetPhoto } from '../../../src/lib/storage';
import { colors, spacing } from '../../../src/theme/tokens';

export default function EditarMascotaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const { data: pet, isLoading } = usePet(id);
  const updatePet = useUpdatePet(id);
  const deletePet = useDeletePet();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar mascota',
      `¿Seguro que querés eliminar a ${pet?.nombre}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deletePet.mutateAsync(id);
            router.replace('/(dueno)/mascota');
          },
        },
      ]
    );
  };

  const handleSubmit: React.ComponentProps<typeof PetForm>['onSubmit'] = async (
    values,
    localImageUri
  ) => {
    setSaving(true);
    setError(null);

    try {
      let fotoUrl = values.foto_url;
      if (localImageUri && session?.user.id) {
        fotoUrl = await uploadPetPhoto(session.user.id, id, localImageUri);
      }

      await updatePet.mutateAsync({ ...values, foto_url: fotoUrl });
      router.replace(`/mascota/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !pet) {
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
      <Heading2 style={styles.title}>Editar mascota</Heading2>
      <PetForm
        initialValues={pet}
        submitLabel="Guardar cambios"
        loading={saving}
        error={error}
        onSubmit={handleSubmit}
      />
      <Button
        label="Eliminar mascota"
        variant="danger"
        onPress={handleDelete}
        style={styles.deleteButton}
      />
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
