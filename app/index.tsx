import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Icon } from '../src/components/Icon';
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
      <View style={styles.decorativeCircleGold} pointerEvents="none" />

      <View style={styles.logoRow}>
        <Icon name="paw" size={30} color={colors.primary} strokeWidth={1.8} />
        <AppText variant="logo">Mawis</AppText>
      </View>

      <Heading1 style={styles.title}>Paseos y cuidado para tu mascota, cerca tuyo</Heading1>
      <MutedText style={styles.subtitle}>
        Contanos quién sos para armarte la experiencia justa.
      </MutedText>

      <View style={styles.cards}>
        <RoleCard
          variant="light"
          icon="paw"
          label="Soy dueño de mascota"
          description="Registro gratis: encontrá paseadores y cuidadores"
          onPress={() => elegirRol('dueno')}
        />
        <RoleCard
          variant="dark"
          icon="store"
          label="Soy paseador o cuidador"
          description="Registro gratis: ofrecé tus servicios de paseo y cuidado"
          onPress={() => elegirRol('empresa')}
        />
      </View>

      <Pressable style={styles.loginLink} onPress={() => router.push('/auth/login')} hitSlop={8}>
        <MutedText style={styles.loginLinkText}>¿Ya tenés cuenta? </MutedText>
        <AppText variant="bodyMedium" style={styles.loginLinkAction}>
          Iniciar sesión
        </AppText>
      </Pressable>
    </Screen>
  );
}

function RoleCard({
  variant,
  icon,
  label,
  description,
  onPress,
}: {
  variant: 'light' | 'dark';
  icon: 'paw' | 'store';
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
      <View style={[styles.cardIcon, isDark ? styles.cardIconDark : styles.cardIconLight]}>
        <Icon name={icon} size={26} color={isDark ? colors.cream : colors.primary} strokeWidth={1.8} />
      </View>
      <View style={styles.cardText}>
        <AppText variant="bodyMedium" style={isDark && styles.cardLabelDark}>
          {label}
        </AppText>
        <AppText variant="bodyMuted" style={[styles.cardDescription, isDark && styles.cardDescriptionDark]}>
          {description}
        </AppText>
      </View>
      <Icon name="chevronRight" size={20} color={isDark ? 'rgba(245,234,216,0.6)' : colors.textFaint} strokeWidth={2} />
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
    top: -90,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.primaryLight,
  },
  decorativeCircleGold: {
    position: 'absolute',
    top: -20,
    right: 64,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(198,113,57,0.14)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginLeft: spacing.lg,
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
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: 'rgba(32,30,29,0.4)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  cardDark: {
    backgroundColor: colors.textDark,
    shadowColor: 'rgba(32,30,29,0.6)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
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
    color: 'rgba(245,234,216,0.6)',
  },
  loginLink: {
    marginTop: 'auto',
    marginBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginLinkText: {
    fontSize: 13.5,
  },
  loginLinkAction: {
    fontSize: 13.5,
    color: colors.primary,
  },
});
