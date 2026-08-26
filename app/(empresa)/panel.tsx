import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../src/components/Button';
import { Icon, type IconName } from '../../src/components/Icon';
import { Screen } from '../../src/components/Screen';
import { SignOutButton } from '../../src/components/SignOutButton';
import { AppText, Heading1, Heading2, MutedText } from '../../src/components/Typography';
import { useMyBusiness, useUpdateBusiness } from '../../src/hooks/useBusiness';
import { useBusinessStats } from '../../src/hooks/useBusinessStats';
import { useProfile } from '../../src/hooks/useProfile';
import { useReviews } from '../../src/hooks/useReviews';
import { colors, radii, spacing } from '../../src/theme/tokens';

const BOOST_DIAS = 30;

export default function PanelEmpresaScreen() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: business, isLoading: loadingBusiness } = useMyBusiness();
  const { data: stats } = useBusinessStats(business?.id);
  const { data: reviews, stats: reviewStats } = useReviews(business?.id);
  const updateBusiness = useUpdateBusiness(business?.id ?? '');

  if (loadingBusiness) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!business) {
    return (
      <Screen>
        <Heading1 style={styles.title}>Panel</Heading1>
        <MutedText style={styles.aviso}>Todavía no completaste el alta de tu negocio.</MutedText>
        <Button label="Completar alta" onPress={() => router.push('/(empresa)/alta')} />
      </Screen>
    );
  }

  const boostVigente = business.boost_activo && business.boost_vence && new Date(business.boost_vence) > new Date();

  const handleDestacar = () => {
    const vence = new Date();
    vence.setDate(vence.getDate() + BOOST_DIAS);
    updateBusiness.mutate({ boost_activo: true, boost_vence: vence.toISOString() });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <MutedText>Hola, {profile?.nombre}</MutedText>
          <Heading2>{business.nombre}</Heading2>
        </View>
        <View style={styles.headerIcon}>
          <Icon name="bell" size={17} color={colors.textDark} strokeWidth={1.8} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatCard icon="eye" valor={stats?.vistasEstaSemana ?? 0} label="Vistas esta semana" />
        <StatCard icon="chatBubble" valor={stats?.contactos ?? 0} label="Contactos" />
        <StatCard
          icon="star"
          valor={reviewStats.total > 0 ? reviewStats.promedio.toFixed(1) : '—'}
          label={`${reviewStats.total} reseñas`}
        />
      </View>

      <View style={styles.boostCard}>
        <View style={styles.boostCircle} pointerEvents="none" />
        <View style={styles.boostContent}>
          <View style={styles.boostIcon}>
            <Icon name="trendingUp" size={19} color={colors.cream} strokeWidth={2} />
          </View>
          <View style={styles.boostTextBlock}>
            {boostVigente ? (
              <>
                <AppText variant="bodyMedium" style={styles.boostTitle}>
                  Tu perfil está destacado
                </AppText>
                <MutedText style={styles.boostSubtitle}>
                  Vigente hasta el{' '}
                  {new Date(business.boost_vence as string).toLocaleDateString('es-AR')}.
                </MutedText>
              </>
            ) : (
              <>
                <AppText variant="bodyMedium" style={styles.boostTitle}>
                  Aparecé primero en tu zona
                </AppText>
                <MutedText style={styles.boostSubtitle}>
                  Destacá tu perfil en los resultados de búsqueda.
                </MutedText>
              </>
            )}
          </View>
        </View>
        {!boostVigente && (
          <Pressable
            onPress={handleDestacar}
            disabled={updateBusiness.isPending}
            style={styles.boostButton}
          >
            <AppText variant="bodyMedium" style={styles.boostButtonText}>
              {updateBusiness.isPending ? 'Activando…' : 'Destacar mi perfil'}
            </AppText>
          </Pressable>
        )}
      </View>

      <View style={styles.reviewsHeader}>
        <AppText variant="bodyMedium">Reseñas recientes</AppText>
        <Pressable onPress={() => router.push('/(empresa)/resenas')}>
          <AppText variant="bodyMedium" style={styles.verTodas}>
            Ver todas
          </AppText>
        </Pressable>
      </View>

      {reviews?.slice(0, 2).map((review) => (
        <View key={review.id} style={styles.reviewCard}>
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
          {review.comentario && <MutedText numberOfLines={2}>{review.comentario}</MutedText>}
          {!review.respuesta_empresa && (
            <Pressable onPress={() => router.push('/(empresa)/resenas')}>
              <AppText variant="bodyMedium" style={styles.responderLink}>
                Responder
              </AppText>
            </Pressable>
          )}
        </View>
      ))}

      <SignOutButton />
    </Screen>
  );
}

function StatCard({
  icon,
  valor,
  label,
}: {
  icon: IconName;
  valor: string | number;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <Icon
        name={icon}
        size={16}
        color={icon === 'star' ? colors.gold : colors.textFaint}
        strokeWidth={1.8}
      />
      <AppText variant="h2" style={styles.statValor}>
        {valor}
      </AppText>
      <MutedText style={styles.statLabel}>{label}</MutedText>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
  title: {
    marginTop: spacing.xl,
  },
  aviso: {
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 12,
    gap: 8,
  },
  statValor: {
    fontSize: 19,
  },
  statLabel: {
    fontSize: 10.5,
    marginTop: -4,
  },
  boostCard: {
    backgroundColor: colors.textDark,
    borderRadius: 18,
    padding: spacing.md + 2,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  boostCircle: {
    position: 'absolute',
    top: -30,
    right: -24,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(46,111,94,0.35)',
  },
  boostContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 4,
  },
  boostIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boostTextBlock: {
    flex: 1,
    gap: 4,
  },
  boostTitle: {
    color: colors.cream,
    fontSize: 14.5,
  },
  boostSubtitle: {
    color: 'rgba(245,234,216,0.6)',
    fontSize: 12,
    lineHeight: 18,
  },
  boostButton: {
    marginTop: 14,
    backgroundColor: colors.cream,
    borderRadius: 11,
    padding: 11,
    alignItems: 'center',
  },
  boostButtonText: {
    color: colors.textDark,
    fontSize: 13.5,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  verTodas: {
    color: colors.primary,
    fontSize: 13,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewStars: {
    marginLeft: 'auto',
    flexDirection: 'row',
    gap: 1,
  },
  responderLink: {
    color: colors.primary,
  },
});
