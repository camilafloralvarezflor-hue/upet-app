import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { SignOutButton } from '../../src/components/SignOutButton';
import { Heading1, Heading3, MutedText } from '../../src/components/Typography';
import { usePets } from '../../src/hooks/usePets';
import type { Pet } from '../../src/lib/database.types';
import { colors, radii, spacing } from '../../src/theme/tokens';

export default function MisMascotasScreen() {
  const router = useRouter();
  const { data: pets, isLoading } = usePets();

  return (
    <Screen>
      <Heading1 style={styles.title}>Mis mascotas</Heading1>

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {!isLoading && pets && pets.length === 0 && (
        <View style={styles.empty}>
          <MutedText style={styles.emptyText}>
            Todavía no cargaste ninguna mascota. Agregá la primera para llevar su carnet de
            vacunas.
          </MutedText>
        </View>
      )}

      {!isLoading && pets && pets.length > 0 && (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PetCard pet={item} onPress={() => router.push(`/mascota/${item.id}`)} />
          )}
        />
      )}

      <Button
        label="+ Agregar mascota"
        onPress={() => router.push('/mascota/nuevo')}
        style={styles.addButton}
      />
      <SignOutButton />
    </Screen>
  );
}

function PetCard({ pet, onPress }: { pet: Pet; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {pet.foto_url ? (
        <Image source={{ uri: pet.foto_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}
      <View style={styles.cardText}>
        <Heading3>{pet.nombre}</Heading3>
        <MutedText>{[pet.especie, pet.raza].filter(Boolean).join(' · ')}</MutedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  loading: {
    marginTop: spacing.xl,
  },
  empty: {
    marginTop: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  cardPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  addButton: {
    marginTop: spacing.md,
  },
});
