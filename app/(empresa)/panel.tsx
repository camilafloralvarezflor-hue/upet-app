import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { SignOutButton } from '../../src/components/SignOutButton';
import { AppText, Heading1, Heading2, Heading3, MutedText } from '../../src/components/Typography';
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
        <View style={styles.headerIcon} />
      </View>

      <View style={styles.statsRow}>
        <StatCard valor={stats?.vistasEstaSemana ?? 0} label="Vistas esta semana" />
        <StatCard valor={stats?.contactos ?? 0} label="Contactos" />
        <StatCard
          valor={reviewStats.total > 0 ? reviewStats.promedio.toFixed(1) : '—'}
          label={`${reviewStats.total} reseñas`}
        />
      </View>

      <View style={styles.boostCard}>
        <View style={styles.boostIcon} />
        {boostVigente ? (
          <>
            <Heading3>Tu perfil está destacado</Heading3>
            <MutedText style={styles.boostSubtitle}>
              Vigente hasta el{' '}
              {new Date(business.boost_vence as string).toLocaleDateString('es-AR')}.
            </MutedText>
          </>
        ) : (
          <>
            <Heading3>Aparecé primero en tu zona</Heading3>
            <MutedText style={styles.boostSubtitle}>
              Destacá tu perfil en los resultados de búsqueda.
            </MutedText>
            <Button
              label={updateBusiness.isPending ? 'Activando…' : 'Destacar mi perfil'}
              onPress={handleDestacar}
              disabled={updateBusiness.isPending}
              style={styles.boostButton}
            />
          </>
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
            <AppText style={styles.reviewStars}>{'★'.repeat(review.calificacion)}</AppText>
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

function StatCard({ valor, label }: { valor: string | number; label: string }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon} />
      <Heading2>{valor}</Heading2>
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
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.sm,
    gap: 4,
  },
  statIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  statLabel: {
    fontSize: 11,
  },
  boostCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  boostIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.xs,
  },
  boostSubtitle: {
    marginBottom: spacing.xs,
  },
  boostButton: {
    marginTop: spacing.xs,
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
    color: colors.gold,
    fontSize: 12,
  },
  responderLink: {
    color: colors.primary,
  },
});
