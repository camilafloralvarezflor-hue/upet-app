import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme/tokens';

export function StepProgress({ step, totalSteps = 3 }: { step: number; totalSteps?: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[styles.segment, index < step ? styles.segmentActive : styles.segmentInactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentInactive: {
    backgroundColor: colors.border,
  },
});
