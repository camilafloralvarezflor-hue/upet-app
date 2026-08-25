import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Heading3, MutedText } from './Typography';
import { StarRating } from './StarRating';
import { colors, radii, spacing } from '../theme/tokens';
import type { Business } from '../lib/database.types';
import { rubroLabel } from '../lib/business-rubros';
import { computeEstadoHorario } from '../lib/business-hours-status';
import { formatDistancia } from '../lib/geo';

interface BusinessCardProps {
  business: Business;
  distanciaKm: number | null;
  ratingPromedio: number;
  ratingTotal: number;
  onPress: () => void;
}

export function BusinessCard({
  business,
  distanciaKm,
  ratingPromedio,
  ratingTotal,
  onPress,
}: BusinessCardProps) {
  const estado = computeEstadoHorario(business.horarios);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {business.fotos[0] ? (
        <Image source={{ uri: business.fotos[0] }} style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder} />
      )}
      <View style={styles.info}>
        <Heading3 numberOfLines={1}>{business.nombre}</Heading3>
        <MutedText>
          {rubroLabel(business.rubro)}
          {distanciaKm != null ? ` · ${formatDistancia(distanciaKm)}` : ''}
        </MutedText>
        <View style={styles.bottomRow}>
          <StarRating promedio={ratingPromedio} total={ratingTotal} />
          <MutedText style={estado.abierto ? styles.abierto : styles.cerrado}>
            {estado.abierto ? '● ' : ''}
            {estado.label}
          </MutedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  cardPressed: {
    opacity: 0.85,
  },
  photo: {
    width: 62,
    height: 62,
    borderRadius: radii.md,
  },
  photoPlaceholder: {
    width: 62,
    height: 62,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
  },
  info: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  abierto: {
    color: colors.primary,
    fontSize: 12,
  },
  cerrado: {
    fontSize: 12,
  },
});
