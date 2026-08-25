import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../src/components/Button';
import { Screen } from '../src/components/Screen';
import { BodyText, Heading1, MutedText } from '../src/components/Typography';
import { colors, radii, spacing } from '../src/theme/tokens';

type Role = 'dueno' | 'empresa';

export default function RegistroScreen() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);

  const handleContinuar = () => {
    if (role === 'dueno') {
      router.replace('/(dueno)/mascota');
    } else if (role === 'empresa') {
      router.replace('/(empresa)/alta');
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Heading1>Bienvenido a UPET</Heading1>
        <MutedText style={styles.subtitle}>
          El lugar donde tu mascota encuentra todo lo que necesita.
        </MutedText>
      </View>

      <View style={styles.roles}>
        <RoleCard
          label="Soy dueño de mascota"
          description="Buscá servicios cercanos, llevá el carnet de vacunas y gestioná turnos."
          selected={role === 'dueno'}
          onPress={() => setRole('dueno')}
        />
        <RoleCard
          label="Tengo una empresa"
          description="Veterinaria, paseador, peluquero, petshop o cuidador. Registro gratuito."
          selected={role === 'empresa'}
          onPress={() => setRole('empresa')}
        />
      </View>

      <Button label="Continuar" onPress={handleContinuar} disabled={!role} />
    </Screen>
  );
}

function RoleCard({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <BodyText style={styles.cardLabel}>{label}</BodyText>
      <MutedText>{description}</MutedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  roles: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: colors.white,
    gap: spacing.xs,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  cardLabel: {
    fontWeight: '600',
  },
});
