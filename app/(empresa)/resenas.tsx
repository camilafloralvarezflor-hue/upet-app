import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { Heading1, MutedText, AppText } from '../../src/components/Typography';
import { useMyBusiness } from '../../src/hooks/useBusiness';
import { useRespondReview, useReviews } from '../../src/hooks/useReviews';
import { colors, radii, spacing } from '../../src/theme/tokens';

export default function ResenasEmpresaScreen() {
  const router = useRouter();
  const { data: business, isLoading: loadingBusiness } = useMyBusiness();
  const { data: reviews, stats, isLoading: loadingReviews } = useReviews(business?.id);
  const respondReview = useRespondReview(business?.id ?? '');
  const [respondiendoId, setRespondiendoId] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState('');

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
        <Heading1 style={styles.title}>Reseñas</Heading1>
        <MutedText style={styles.empty}>
          Todavía no completaste el alta de tu negocio.
        </MutedText>
        <Button label="Completar alta" onPress={() => router.push('/(empresa)/alta')} />
      </Screen>
    );
  }

  const handleEnviarRespuesta = async (reviewId: string) => {
    if (!respuesta.trim()) return;
    await respondReview.mutateAsync({ reviewId, respuesta: respuesta.trim() });
    setRespondiendoId(null);
    setRespuesta('');
  };

  return (
    <Screen>
      <Heading1 style={styles.title}>Reseñas</Heading1>
      <MutedText style={styles.subtitle}>
        {stats.total > 0 ? `${stats.promedio.toFixed(1)} ★ · ${stats.total} reseñas` : 'Todavía no tenés reseñas.'}
      </MutedText>

      {loadingReviews && (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {reviews?.map((review) => (
        <View key={review.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <AppText variant="bodyMedium">{review.profiles?.nombre ?? 'Usuario'}</AppText>
            <AppText style={styles.stars}>{'★'.repeat(review.calificacion)}</AppText>
          </View>
          {review.comentario && <MutedText>{review.comentario}</MutedText>}

          {review.respuesta_empresa ? (
            <View style={styles.respuesta}>
              <AppText variant="caption" style={styles.respuestaTitulo}>
                Tu respuesta
              </AppText>
              <MutedText>{review.respuesta_empresa}</MutedText>
            </View>
          ) : respondiendoId === review.id ? (
            <View style={styles.responderForm}>
              <TextField
                label="Tu respuesta"
                value={respuesta}
                onChangeText={setRespuesta}
                placeholder="Gracias por tu comentario…"
                multiline
              />
              <View style={styles.responderActions}>
                <Button
                  label="Cancelar"
                  variant="secondary"
                  onPress={() => setRespondiendoId(null)}
                  style={styles.responderActionButton}
                />
                <Button
                  label={respondReview.isPending ? 'Enviando…' : 'Enviar'}
                  onPress={() => handleEnviarRespuesta(review.id)}
                  disabled={respondReview.isPending}
                  style={styles.responderActionButton}
                />
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setRespondiendoId(review.id);
                setRespuesta('');
              }}
            >
              <AppText variant="bodyMedium" style={styles.responderLink}>
                Responder
              </AppText>
            </Pressable>
          )}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.xl,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  loading: {
    marginTop: spacing.xl,
  },
  empty: {
    marginVertical: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stars: {
    color: colors.gold,
    fontSize: 13,
  },
  respuesta: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
    gap: 2,
  },
  respuestaTitulo: {
    color: colors.primary,
    fontWeight: '700',
  },
  responderLink: {
    color: colors.primary,
    marginTop: spacing.xs,
  },
  responderForm: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  responderActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  responderActionButton: {
    flex: 1,
  },
});
