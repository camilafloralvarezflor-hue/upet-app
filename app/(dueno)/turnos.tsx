import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '../../src/components/Screen';
import { AppText, Heading1, Heading3, MutedText } from '../../src/components/Typography';
import { useMyAppointments } from '../../src/hooks/useAppointments';
import { colors, radii, spacing } from '../../src/theme/tokens';
import type { AppointmentStatus } from '../../src/lib/database.types';

const ESTADO_META: Record<AppointmentStatus, { label: string; bg: string; text: string }> = {
  pendiente: { label: 'Pendiente', bg: '#FCEFDA', text: '#7A5416' },
  confirmado: { label: 'Confirmado', bg: '#EAF3F0', text: '#2E6F5E' },
  en_curso: { label: 'En curso', bg: '#EAF3F0', text: '#2E6F5E' },
  completado: { label: 'Completado', bg: '#E4E0D8', text: '#5B6B65' },
  cancelado: { label: 'Cancelado', bg: '#FDEDEB', text: '#C2483E' },
};

export default function MisTurnosScreen() {
  const router = useRouter();
  const { data: turnos, isLoading } = useMyAppointments();

  return (
    <Screen>
      <Heading1 style={styles.title}>Mis turnos</Heading1>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !turnos || turnos.length === 0 ? (
        <MutedText style={styles.empty}>
          Todavía no reservaste ningún paseo o cuidado. Buscá un prestador cerca tuyo para
          empezar.
        </MutedText>
      ) : (
        turnos.map((turno) => {
          const meta = ESTADO_META[turno.estado];
          return (
            <Pressable
              key={turno.id}
              style={styles.card}
              onPress={() => {
                if (turno.estado === 'en_curso') router.push(`/turno/${turno.id}/en-vivo`);
              }}
            >
              <View style={styles.cardHeader}>
                <Heading3 numberOfLines={1} style={styles.cardTitle}>
                  {turno.businesses?.nombre ?? 'Negocio'}
                </Heading3>
                <View style={[styles.badge, { backgroundColor: meta.bg }]}>
                  <AppText variant="caption" style={{ color: meta.text, fontWeight: '700' }}>
                    {meta.label}
                  </AppText>
                </View>
              </View>
              <MutedText>
                {turno.pets?.nombre ?? 'Mascota'} ·{' '}
                {new Date(turno.fecha_hora).toLocaleString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </MutedText>
              {turno.tipo_servicio && <MutedText>{turno.tipo_servicio}</MutedText>}
              {turno.estado === 'en_curso' && (
                <AppText variant="bodyMedium" style={styles.verEnVivo}>
                  Ver recorrido en vivo →
                </AppText>
              )}
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  loading: {
    marginTop: spacing.xl,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
  },
  badge: {
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  verEnVivo: {
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
