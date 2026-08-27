import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../src/components/Button';
import { Icon, type IconName } from '../../src/components/Icon';
import { Screen } from '../../src/components/Screen';
import { StarRating } from '../../src/components/StarRating';
import { AppText, Heading2, MutedText } from '../../src/components/Typography';
import { useBusinessDetail } from '../../src/hooks/useBusinesses';
import { useLogBusinessEvent } from '../../src/hooks/useBusinessStats';
import { useMyReviewForBusiness, useReviews } from '../../src/hooks/useReviews';
import { useProfile } from '../../src/hooks/useProfile';
import { colors, radii, spacing } from '../../src/theme/tokens';
import { rubroLabel } from '../../src/lib/business-rubros';
import { computeEstadoHorario } from '../../src/lib/business-hours-status';

const RUBRO_ICON: Record<string, IconName> = {
  paseador: 'paw',
  cuidador: 'paw',
  veterinaria: 'store',
  peluqueria: 'scissors',
  petshop: 'store',
};

export default function PerfilPublicoEmpresaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: business, isLoading } = useBusinessDetail(id);
  const { data: reviews, stats } = useReviews(id);
  const { data: profile } = useProfile();
  const { data: miResena } = useMyReviewForBusiness(id);
  const logEvent = useLogBusinessEvent();
  const [fotoActiva, setFotoActiva] = useState(0);
  const [favorito, setFavorito] = useState(false);

  useEffect(() => {
    if (id) logEvent.mutate({ businessId: id, tipo: 'vista' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading || !business) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const estado = computeEstadoHorario(business.horarios);

  const handleLlamar = () => {
    if (business.telefono) {
      logEvent.mutate({ businessId: business.id, tipo: 'contacto' });
      Linking.openURL(`tel:${business.telefono}`);
    }
  };

  const handleComoLlegar = () => {
    const query =
      business.lat != null && business.lng != null
        ? `${business.lat},${business.lng}`
        : encodeURIComponent(business.direccion ?? business.nombre);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const handleCompartir = () => {
    Share.share({
      message: `${business.nombre} — encontralo en Mawis`,
    });
  };

  const handleReservar = () => {
    if (business.turnos_habilitado) {
      logEvent.mutate({ businessId: business.id, tipo: 'contacto' });
      router.push(`/negocio/${business.id}/reservar`);
    } else {
      handleLlamar();
    }
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {business.fotos.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / 390);
                setFotoActiva(index);
              }}
            >
              {business.fotos.map((foto) => (
                <Image key={foto} source={{ uri: foto }} style={styles.bannerPhoto} />
              ))}
            </ScrollView>
          ) : (
            <LinearGradient
              colors={['#272E1B', '#1F4E42']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerPlaceholder}
            >
              <Icon name={RUBRO_ICON[business.rubro] ?? 'store'} size={52} color="rgba(251,248,244,0.55)" strokeWidth={1.5} />
            </LinearGradient>
          )}

          <Pressable onPress={() => router.back()} style={[styles.headerButton, styles.backButton]}>
            <Icon name="chevronLeft" size={18} color={colors.white} strokeWidth={2} />
          </Pressable>
          <Pressable
            onPress={() => setFavorito((v) => !v)}
            style={[styles.headerButton, styles.shareButton]}
          >
            <Icon name="heart" size={17} color={favorito ? colors.gold : colors.white} strokeWidth={2} />
          </Pressable>

          {business.fotos.length > 1 && (
            <View style={styles.dots}>
              {business.fotos.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === fotoActiva && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Heading2>{business.nombre}</Heading2>
            <Icon name="checkBadge" size={16} color={colors.primary} />
          </View>
          <View style={styles.metaRow}>
            <StarRating promedio={stats.promedio} total={stats.total} />
            <MutedText>· {rubroLabel(business.rubro)}</MutedText>
          </View>
          <MutedText style={estado.abierto ? styles.abierto : styles.cerrado}>
            {estado.abierto ? '● ' : ''}
            {estado.label}
          </MutedText>

          <View style={styles.actions}>
            <ActionButton icon="phone" label="Llamar" onPress={handleLlamar} disabled={!business.telefono} />
            <ActionButton icon="navigation" label="Cómo llegar" onPress={handleComoLlegar} />
            <ActionButton icon="share" label="Compartir" onPress={handleCompartir} />
          </View>

          {business.servicios.length > 0 && (
            <View style={styles.section}>
              <AppText variant="bodyMedium">Servicios</AppText>
              <View style={styles.chips}>
                {business.servicios.map((servicio) => (
                  <View key={servicio} style={styles.chip}>
                    <MutedText style={styles.chipText}>{servicio}</MutedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <AppText variant="bodyMedium">Reseñas ({stats.total})</AppText>
              {profile?.role === 'dueno' && (
                <Pressable onPress={() => router.push(`/negocio/${business.id}/resena`)}>
                  <AppText variant="bodyMedium" style={styles.reviewsAction}>
                    {miResena ? 'Editar mi reseña' : 'Escribir reseña'}
                  </AppText>
                </Pressable>
              )}
            </View>
            {reviews && reviews.length === 0 && (
              <MutedText style={styles.sinResenas}>
                Todavía no hay reseñas para este negocio.
              </MutedText>
            )}
            {reviews?.slice(0, 5).map((review) => (
              <View key={review.id} style={styles.review}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <AppText variant="caption">
                      {(review.profiles?.nombre ?? '?').slice(0, 2).toUpperCase()}
                    </AppText>
                  </View>
                  <AppText variant="bodyMedium">{review.profiles?.nombre ?? 'Usuario'}</AppText>
                  <View style={styles.reviewStars}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Icon
                        key={index}
                        name={index < review.calificacion ? 'star' : 'starOutline'}
                        size={11}
                        color={colors.gold}
                      />
                    ))}
                  </View>
                </View>
                {review.comentario && <MutedText>{review.comentario}</MutedText>}
                {review.respuesta_empresa && (
                  <View style={styles.respuesta}>
                    <AppText variant="caption" style={styles.respuestaTitulo}>
                      Respuesta de {business.nombre}
                    </AppText>
                    <MutedText>{review.respuesta_empresa}</MutedText>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {business.turnos_habilitado && (
          <Pressable style={styles.footerIconButton} onPress={handleLlamar} disabled={!business.telefono}>
            <Icon name="phone" size={20} color={colors.textDark} strokeWidth={1.8} />
          </Pressable>
        )}
        <Button
          label={business.turnos_habilitado ? 'Reservar turno' : 'Llamar para reservar'}
          variant="dark"
          icon={business.turnos_habilitado ? undefined : 'phone'}
          onPress={handleReservar}
          style={styles.footerButton}
        />
      </View>
    </Screen>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
    >
      <Icon name={icon} size={17} color={colors.primary} strokeWidth={2} />
      <MutedText style={styles.actionLabel}>{label}</MutedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  loading: {
    marginTop: spacing.xl,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  header: {
    height: 168,
    backgroundColor: colors.primaryLight,
  },
  bannerPhoto: {
    width: 390,
    height: 168,
  },
  bannerPlaceholder: {
    width: '100%',
    height: 168,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    position: 'absolute',
    top: 48,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(32,30,29,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    left: spacing.md,
  },
  shareButton: {
    right: spacing.md,
  },
  dots: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dotActive: {
    backgroundColor: colors.white,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  abierto: {
    color: colors.primary,
    fontSize: 13,
    marginTop: 2,
  },
  cerrado: {
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: spacing.sm + 2,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  section: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewsAction: {
    color: colors.primary,
    fontSize: 13,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  chipText: {
    fontSize: 13,
  },
  sinResenas: {
    fontSize: 13,
  },
  review: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewStars: {
    marginLeft: 'auto',
    flexDirection: 'row',
    gap: 1,
  },
  respuesta: {
    backgroundColor: '#EEE7DB',
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    gap: 2,
  },
  respuestaTitulo: {
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  footerIconButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButton: {
    flex: 1,
  },
});
