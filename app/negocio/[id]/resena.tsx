import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../../src/components/Button';
import { Screen } from '../../../src/components/Screen';
import { StarInput } from '../../../src/components/StarInput';
import { TextField } from '../../../src/components/TextField';
import { Heading2, MutedText } from '../../../src/components/Typography';
import { useBusinessDetail } from '../../../src/hooks/useBusinesses';
import { useMyReviewForBusiness, useSaveReview } from '../../../src/hooks/useReviews';
import { colors, spacing } from '../../../src/theme/tokens';

export default function EscribirResenaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: business } = useBusinessDetail(id);
  const { data: miResena, isLoading } = useMyReviewForBusiness(id);
  const saveReview = useSaveReview(id);

  const [calificacion, setCalificacion] = useState(miResena?.calificacion ?? 0);
  const [comentario, setComentario] = useState(miResena?.comentario ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (calificacion === 0) {
      setError('Elegí una calificación de 1 a 5 estrellas.');
      return;
    }
    setError(null);
    try {
      await saveReview.mutateAsync({ calificacion, comentario: comentario.trim() || null });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar tu reseña.');
    }
  };

  if (isLoading) return <Screen />;

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <MutedText>‹ Volver</MutedText>
      </Pressable>
      <Heading2 style={styles.title}>
        {miResena ? 'Editar tu reseña' : 'Escribir una reseña'}
      </Heading2>
      <MutedText style={styles.subtitle}>{business?.nombre}</MutedText>

      <View style={styles.starsBlock}>
        <StarInput value={calificacion} onChange={setCalificacion} />
      </View>

      <TextField
        label="Comentario (opcional)"
        value={comentario}
        onChangeText={setComentario}
        placeholder="Contá cómo fue tu experiencia"
        multiline
      />

      {error && <MutedText style={styles.error}>{error}</MutedText>}

      <Button
        label={saveReview.isPending ? 'Guardando…' : 'Publicar reseña'}
        onPress={handleSubmit}
        disabled={saveReview.isPending}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  starsBlock: {
    marginBottom: spacing.lg,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
  },
  submit: {
    marginTop: spacing.lg,
  },
});
