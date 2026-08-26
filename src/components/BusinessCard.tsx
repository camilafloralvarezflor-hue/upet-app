import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { Heading3, MutedText } from './Typography';
import { StarRating } from './StarRating';
import { colors, radii, spacing } from '../theme/tokens';
import type { Business } from '../lib/database.types';
import { rubroLabel } from '../lib/business-rubros';
import { computeEstadoHorario } from '../lib/business-hours-status';
import { formatDistancia } from '../lib/geo';

const RUBRO_ICON: Record<string, IconName> = {
  paseador: 'paw',
  cuidador: 'paw',
  veterinaria: 'store',
  peluqueria: 'scissors',
  petshop: 'store',
};

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
        <View style={styles.photoPlaceholder}>
          <Icon name={RUBRO_ICON[business.rubro] ?? 'store'} size={28} color={colors.primary} strokeWidth={1.7} />
        </View>
      )}
      <View style={styles.info}>
        <Heading3 numberOfLines={1}>{business.nombre}</Heading3>
        <MutedText style={styles.subtitle}>
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
  },
  cardPressed: {
    opacity: 0.85,
  },
  photo: {
    width: 62,
    height: 62,
    borderRadius: 14,
  },
  photoPlaceholder: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textFaint,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  abierto: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  cerrado: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
});
