import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Icon } from '../../src/components/Icon';
import { Screen } from '../../src/components/Screen';
import { AppText, MutedText } from '../../src/components/Typography';
import { useMyAppointments } from '../../src/hooks/useAppointments';
import { colors, radii, spacing } from '../../src/theme/tokens';

export default function PagosScreen() {
  const router = useRouter();
  const { data: turnos, isLoading } = useMyAppointments();

  const pagados = (turnos ?? []).filter((t) => t.estado === 'completado' && t.monto != null);
  const totalMes = pagados
    .filter((t) => {
      const fecha = new Date(t.fecha_hora);
      const hoy = new Date();
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    })
    .reduce((acc, t) => acc + (t.monto ?? 0), 0);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Icon name="chevronLeft" size={18} color={colors.textDark} strokeWidth={2.75} />
        </Pressable>
        <AppText variant="display" style={styles.title}>
          Tus pagos
        </AppText>
      </View>

      <View style={styles.resumen}>
        <MutedText style={styles.resumenMuted}>Gastaste este mes</MutedText>
        <AppText variant="display" style={styles.resumenTotal}>
          ${totalMes.toLocaleString('es-AR')}
        </AppText>
        <MutedText style={styles.resumenNota}>
          Pagás directo al prestador al finalizar cada servicio — Mawis se queda con una comisión.
          No hay plan ni suscripción.
        </MutedText>
      </View>

      <AppText variant="label" style={styles.movimientosLabel}>
        Movimientos
      </AppText>

      {isLoading ? (
        <ActivityIndicator color={colors.brand900} style={styles.loading} />
      ) : pagados.length === 0 ? (
        <MutedText style={styles.empty}>Todavía no tenés pagos registrados.</MutedText>
      ) : (
        pagados.map((turno) => (
          <View key={turno.id} style={styles.movCard}>
            <View style={styles.movIcon}>
              <Icon name="paw" size={17} color={colors.brand700} strokeWidth={2} />
            </View>
            <View style={styles.movText}>
              <AppText variant="bodyMedium">
                Paseo con {turno.businesses?.nombre ?? 'prestador'}
              </AppText>
              <MutedText style={styles.movFecha}>
                {new Date(turno.fecha_hora).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                })}{' '}
                · {turno.pets?.nombre ?? 'mascota'}
              </MutedText>
            </View>
            <AppText variant="bodyMedium">${turno.monto?.toLocaleString('es-AR')}</AppText>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 3,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 27,
  },
  resumen: {
    backgroundColor: colors.brand900,
    borderRadius: radii.xl + 2,
    padding: spacing.md + 4,
    marginBottom: spacing.lg,
  },
  resumenMuted: {
    color: colors.onDarkMuted,
    fontSize: 12,
  },
  resumenTotal: {
    color: colors.onDark,
    fontSize: 26,
    marginTop: 3,
    marginBottom: spacing.sm,
  },
  resumenNota: {
    color: 'rgba(245,234,216,0.65)',
    fontSize: 12,
    lineHeight: 17,
  },
  movimientosLabel: {
    marginBottom: spacing.sm + 2,
  },
  loading: {
    marginTop: spacing.xl,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  movCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border300,
    borderRadius: radii.lg,
    padding: spacing.md - 3,
    marginBottom: spacing.sm + 1,
  },
  movIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brandLightBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  movText: {
    flex: 1,
  },
  movFecha: {
    fontSize: 11.5,
  },
});
