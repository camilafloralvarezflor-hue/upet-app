import { StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { AppText, MutedText } from './Typography';
import { colors } from '../theme/tokens';

export function StarRating({ promedio, total }: { promedio: number; total: number }) {
  if (total === 0) {
    return <MutedText style={styles.sinResenas}>Sin reseñas todavía</MutedText>;
  }

  return (
    <View style={styles.row}>
      <Icon name="star" size={13} color={colors.gold} />
      <AppText variant="bodyMedium" style={styles.rating}>
        {promedio.toFixed(1)}
      </AppText>
      <MutedText style={styles.total}>({total})</MutedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rating: {
    fontSize: 12.5,
  },
  total: {
    fontSize: 12,
  },
  sinResenas: {
    fontSize: 12.5,
  },
});
