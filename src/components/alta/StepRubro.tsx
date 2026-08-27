import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../Typography';
import { RUBROS_ACTIVOS } from '../../lib/business-rubros';
import { colors, radii, spacing } from '../../theme/tokens';

export function StepRubro({
  value,
  onSelect,
}: {
  value: string | null;
  onSelect: (rubro: string) => void;
}) {
  return (
    <View style={styles.list}>
      {RUBROS_ACTIVOS.map((rubro) => {
        const selected = value === rubro.value;
        return (
          <Pressable
            key={rubro.value}
            onPress={() => onSelect(rubro.value)}
            style={[styles.card, selected && styles.cardSelected]}
          >
            <View style={[styles.icon, selected && styles.iconSelected]} />
            <AppText variant="bodyMedium">{rubro.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  iconSelected: {
    backgroundColor: colors.primary,
  },
});
