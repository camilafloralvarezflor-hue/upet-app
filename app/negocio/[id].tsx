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
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../src/components/Button';
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

export default function PerfilPublicoEmpresaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: business, isLoading } = useBusinessDetail(id);
  const { data: reviews, stats } = useReviews(id);
  const { data: profile } = useProfile();
  const { data: miResena } = useMyReviewForBusiness(id);
  const logEvent = useLogBusinessEvent();
  const [fotoActiva, setFotoActiva] = useState(0);

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
      message: `${business.nombre} — encontralo en UPET`,
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
            <View style={styles.bannerPlaceholder} />
          )}

          <Pressable onPress={() => router.back()} style={[styles.headerButton, styles.backButton]}>
            <AppText variant="h3">‹</AppText>
          </Pressable>
          <Pressable
            onPress={handleCompartir}
            style={[styles.headerButton, styles.shareButton]}
          >
            <AppText variant="h3">↗</AppText>
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

          <View style={styles.avatar} />
        </View>

        <View style={styles.body}>
          <Heading2>{business.nombre}</Heading2>
          <View style={styles.metaRow}>
            <StarRating promedio={stats.promedio} total={stats.total} />
            <MutedText>· {rubroLabel(business.rubro)}</MutedText>
          </View>
          <MutedText style={estado.abierto ? styles.abierto : styles.cerrado}>
            {estado.abierto ? '● ' : ''}
            {estado.label}
          </MutedText>

          <View style={styles.actions}>
            <ActionButton label="Llamar" onPress={handleLlamar} disabled={!business.telefono} />
            <ActionButton label="Cómo llegar" onPress={handleComoLlegar} />
            <ActionButton label="Compartir" onPress={handleCompartir} />
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
                  <AppText style={styles.reviewStars}>{'★'.repeat(review.calificacion)}</AppText>
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
        <View style={styles.footerAvatar} />
        <Button
          label={business.turnos_habilitado ? 'Reservar turno' : 'Llamar para reservar'}
          onPress={handleReservar}
          style={styles.footerButton}
        />
      </View>
    </Screen>
  );
}

function ActionButton({
  label,
  onPress,
  disabled,
}: {
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
      <View style={styles.actionIcon} />
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
    backgroundColor: colors.primaryLight,
  },
  headerButton: {
    position: 'absolute',
    top: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
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
  avatar: {
    position: 'absolute',
    bottom: -26,
    alignSelf: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.cream,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: 4,
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
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionIcon: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.primaryLight,
  },
  actionLabel: {
    fontSize: 12,
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
    color: colors.gold,
    fontSize: 12,
  },
  respuesta: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 2,
  },
  respuestaTitulo: {
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cream,
  },
  footerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
  },
  footerButton: {
    flex: 1,
  },
});
