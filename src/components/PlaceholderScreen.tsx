import { View, StyleSheet } from 'react-native';

import { Screen } from './Screen';
import { Heading2, MutedText, Caption } from './Typography';
import { colors, radii, spacing } from '../theme/tokens';

interface PlaceholderScreenProps {
  titulo: string;
  descripcion: string;
  etapa: string;
}

export function PlaceholderScreen({ titulo, descripcion, etapa }: PlaceholderScreenProps) {
  return (
    <Screen>
      <View style={styles.badge}>
        <Caption style={styles.badgeText}>{etapa}</Caption>
      </View>
      <Heading2 style={styles.title}>{titulo}</Heading2>
      <MutedText>{descripcion}</MutedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  badgeText: {
    color: colors.primary,
  },
  title: {
    marginBottom: spacing.sm,
  },
});
