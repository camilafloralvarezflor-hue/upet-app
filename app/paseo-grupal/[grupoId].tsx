import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Icon } from '../../src/components/Icon';
import { Screen } from '../../src/components/Screen';
import { AppText, MutedText } from '../../src/components/Typography';
import { useAppointmentsGrupo, useIniciarRondaGrupal } from '../../src/hooks/useAppointments';
import { useMyBusiness } from '../../src/hooks/useBusiness';
import { iniciarTrackingEnSegundoPlano } from '../../src/lib/background-location-task';
import { colors, radii, spacing } from '../../src/theme/tokens';

const ORDEN_LABEL = ['1er retiro', '2º', '3º', '4º', '5º'];

export default function PaseoGrupalScreen() {
  const router = useRouter();
  const { grupoId } = useLocalSearchParams<{ grupoId: string }>();
  const { data: business } = useMyBusiness();
  const { data: turnos, isLoading } = useAppointmentsGrupo(grupoId);
  const iniciarRonda = useIniciarRondaGrupal(business?.id);

  if (isLoading || !turnos) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand900} />
        </View>
      </Screen>
    );
  }

  const primerTurno = turnos[0];
  const hora = primerTurno
    ? new Date(primerTurno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : '';

  const handleEmpezarRonda = async () => {
    const ids = turnos.map((t) => t.id);
    const resultado = await iniciarTrackingEnSegundoPlano(ids);
    if (!resultado.ok) return;
    await iniciarRonda.mutateAsync(ids);
    router.replace(`/turno/${primerTurno.id}/en-vivo`);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Icon name="chevronLeft" size={18} color={colors.textDark} strokeWidth={2.75} />
        </Pressable>
        <View style={styles.headerText}>
          <AppText variant="h2">Paseo grupal {hora}</AppText>
          <MutedText style={styles.headerSubtitle}>{turnos.length} mascotas · 45 min</MutedText>
        </View>
      </View>

      {turnos.map((turno, index) => (
        <View key={turno.id} style={styles.petCard}>
          <View style={styles.petIcon}>
            <Icon name="paw" size={22} color={colors.brand700} strokeWidth={1.7} />
          </View>
          <View style={styles.petText}>
            <AppText variant="bodyMedium">{turno.pets?.nombre ?? 'Mascota'}</AppText>
            {turno.tipo_servicio && <MutedText style={styles.petSubtitle}>{turno.tipo_servicio}</MutedText>}
          </View>
          <View style={[styles.badge, index > 0 && styles.badgeNeutro]}>
            <AppText variant="caption" style={[styles.badgeText, index > 0 && styles.badgeTextNeutro]}>
              {ORDEN_LABEL[index] ?? `${index + 1}º`}
            </AppText>
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Pressable onPress={handleEmpezarRonda} style={styles.startButton} disabled={iniciarRonda.isPending}>
          <AppText variant="display" style={styles.startButtonText}>
            {iniciarRonda.isPending ? 'Arrancando…' : 'Empezar la ronda'}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border300,
    borderRadius: radii.lg,
    padding: spacing.md - 2,
    marginBottom: spacing.sm + 3,
  },
  petIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.md + 4,
    backgroundColor: colors.brand200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petText: {
    flex: 1,
    gap: 2,
  },
  petSubtitle: {
    fontSize: 11.5,
  },
  badge: {
    borderRadius: radii.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: colors.brand200,
  },
  badgeNeutro: {
    backgroundColor: colors.bgNeutral,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brandDark,
  },
  badgeTextNeutro: {
    color: colors.textMuted,
  },
  footer: {
    marginTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  startButton: {
    backgroundColor: colors.brand900,
    borderRadius: radii.pill,
    padding: spacing.md + 1,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.onDark,
    fontSize: 15,
  },
});
