import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { PetForm } from '../../src/components/PetForm';
import { Screen } from '../../src/components/Screen';
import { Heading2, MutedText } from '../../src/components/Typography';
import { useCreatePet } from '../../src/hooks/usePets';
import { useSession } from '../../src/lib/auth-context';
import { supabase } from '../../src/lib/supabase';
import { uploadPetPhoto } from '../../src/lib/storage';
import { spacing } from '../../src/theme/tokens';

export default function NuevaMascotaScreen() {
  const router = useRouter();
  const { session } = useSession();
  const createPet = useCreatePet();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit: React.ComponentProps<typeof PetForm>['onSubmit'] = async (
    values,
    localImageUri
  ) => {
    setSaving(true);
    setError(null);

    try {
      const pet = await createPet.mutateAsync(values);

      if (localImageUri && session?.user.id) {
        const fotoUrl = await uploadPetPhoto(session.user.id, pet.id, localImageUri);
        await supabase.from('pets').update({ foto_url: fotoUrl }).eq('id', pet.id);
      }

      router.replace(`/mascota/${pet.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar la mascota.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <MutedText>‹ Volver</MutedText>
      </Pressable>
      <Heading2 style={styles.title}>Agregar mascota</Heading2>
      <PetForm submitLabel="Guardar mascota" loading={saving} error={error} onSubmit={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
