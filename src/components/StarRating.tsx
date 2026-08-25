import { StyleSheet, View } from 'react-native';

import { AppText, MutedText } from './Typography';
import { colors, spacing } from '../theme/tokens';

export function StarRating({ promedio, total }: { promedio: number; total: number }) {
  if (total === 0) {
    return <MutedText style={styles.sinResenas}>Sin reseñas todavía</MutedText>;
  }

  return (
    <View style={styles.row}>
      <AppText variant="bodyMedium" style={styles.star}>
        ★ {promedio.toFixed(1)}
      </AppText>
      <MutedText>({total})</MutedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  star: {
    color: colors.gold,
  },
  sinResenas: {
    fontSize: 12.5,
  },
});
