import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '../src/components/Screen';
import { AppText, Heading1, MutedText } from '../src/components/Typography';
import { colors, radii, spacing } from '../src/theme/tokens';

type Role = 'dueno' | 'empresa';

export default function RegistroScreen() {
  const router = useRouter();

  const elegirRol = (role: Role) => {
    router.push({ pathname: '/auth/sign-up', params: { role } });
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.decorativeCircle} pointerEvents="none" />

      <View style={styles.logoRow}>
        <View style={styles.logoDot} />
        <AppText variant="logo">UPET</AppText>
      </View>

      <Heading1 style={styles.title}>Todo para tu mascota, cerca tuyo</Heading1>
      <MutedText style={styles.subtitle}>
        Contanos quién sos para armarte la experiencia justa.
      </MutedText>

      <View style={styles.cards}>
        <RoleCard
          variant="light"
          label="Soy dueño de mascota"
          description="Buscá servicios y cargá a tus mascotas"
          onPress={() => elegirRol('dueno')}
        />
        <RoleCard
          variant="dark"
          label="Soy una empresa"
          description="Veterinaria, paseador, peluquería, petshop o cuidador"
          onPress={() => elegirRol('empresa')}
        />
      </View>

      <Pressable style={styles.loginLink} onPress={() => router.push('/auth/login')} hitSlop={8}>
        <MutedText style={styles.loginLinkText}>¿Ya tenés cuenta?  Iniciar sesión</MutedText>
      </Pressable>
    </Screen>
  );
}

function RoleCard({
  variant,
  label,
  description,
  onPress,
}: {
  variant: 'light' | 'dark';
  label: string;
  description: string;
  onPress: () => void;
}) {
  const isDark = variant === 'dark';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.cardIcon, isDark ? styles.cardIconDark : styles.cardIconLight]} />
      <View style={styles.cardText}>
        <AppText variant="bodyMedium" style={isDark && styles.cardLabelDark}>
          {label}
        </AppText>
        <AppText variant="bodyMuted" style={[styles.cardDescription, isDark && styles.cardDescriptionDark]}>
          {description}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 0,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -70,
    left: 250,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.primaryLight,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginLeft: spacing.lg,
  },
  logoDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  title: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  cards: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardLight: {
    backgroundColor: colors.white,
  },
  cardDark: {
    backgroundColor: colors.textDark,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  cardIconLight: {
    backgroundColor: colors.primaryLight,
  },
  cardIconDark: {
    backgroundColor: colors.primary,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardLabelDark: {
    color: colors.cream,
  },
  cardDescription: {
    fontSize: 12.5,
  },
  cardDescriptionDark: {
    color: '#B9C2BD',
  },
  loginLink: {
    marginTop: 'auto',
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 13.5,
  },
});
