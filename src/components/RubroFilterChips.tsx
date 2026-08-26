import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from './Typography';
import { RUBROS_ACTIVOS } from '../lib/business-rubros';
import { colors, radii, spacing } from '../theme/tokens';

interface RubroFilterChipsProps {
  value: string | null;
  onChange: (rubro: string | null) => void;
}

export function RubroFilterChips({ value, onChange }: RubroFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Chip label="Todos" selected={value === null} onPress={() => onChange(null)} />
      {RUBROS_ACTIVOS.map((rubro) => (
        <Chip
          key={rubro.value}
          label={rubro.labelPlural}
          selected={value === rubro.value}
          onPress={() => onChange(rubro.value)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <AppText variant="bodyMuted" style={selected && styles.chipTextSelected}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipTextSelected: {
    color: colors.white,
  },
});
