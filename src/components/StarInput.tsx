import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './Typography';
import { colors, spacing } from '../theme/tokens';

export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (calificacion: number) => void;
}) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((estrella) => (
        <Pressable key={estrella} onPress={() => onChange(estrella)} hitSlop={6}>
          <AppText variant="h2" style={estrella <= value ? styles.filled : styles.empty}>
            ★
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filled: {
    color: colors.gold,
  },
  empty: {
    color: colors.border,
  },
});
