import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { AppText, Heading1, MutedText } from '../../src/components/Typography';
import { useMyBusiness } from '../../src/hooks/useBusiness';
import { useAppointmentsForBusiness, useUpdateAppointmentStatus } from '../../src/hooks/useAppointments';
import { proximosDias } from '../../src/lib/turnos-slots';
import { colors, radii, spacing } from '../../src/theme/tokens';
import type { AppointmentStatus } from '../../src/lib/database.types';

const DIA_LABEL = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

const ESTADO_META: Record<AppointmentStatus, { label: string; bg: string; text: string }> = {
  pendiente: { label: 'Pendiente', bg: '#FCEFDA', text: '#7A5416' },
  confirmado: { label: 'Confirmado', bg: '#EAF3F0', text: '#2E6F5E' },
  cancelado: { label: 'Cancelado', bg: '#FDEDEB', text: '#C2483E' },
};

export default function TurnosEmpresaScreen() {
  const router = useRouter();
  const { data: business, isLoading: loadingBusiness } = useMyBusiness();
  const dias = useMemo(() => proximosDias(7), []);
  const [diaSeleccionado, setDiaSeleccionado] = useState(dias[0]);
  const { data: turnos, isLoading: loadingTurnos } = useAppointmentsForBusiness(
    business?.id,
    diaSeleccionado
  );
  const updateStatus = useUpdateAppointmentStatus(business?.id);

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
        <Heading1 style={styles.title}>Turnos</Heading1>
        <MutedText style={styles.aviso}>Todavía no completaste el alta de tu negocio.</MutedText>
        <Button label="Completar alta" onPress={() => router.push('/(empresa)/alta')} />
      </Screen>
    );
  }

  if (!business.turnos_habilitado) {
    return (
      <Screen>
        <Heading1 style={styles.title}>Turnos</Heading1>
        <MutedText style={styles.aviso}>
          No tenés los turnos online activados. Los dueños solo pueden llamarte para reservar.
        </MutedText>
      </Screen>
    );
  }

  return (
    <Screen>
      <Heading1 style={styles.title}>Turnos</Heading1>
      <MutedText style={styles.subtitle}>
        {diaSeleccionado.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </MutedText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.diasRow}>
        {dias.map((dia) => {
          const selected = dia.toDateString() === diaSeleccionado.toDateString();
          return (
            <Pressable
              key={dia.toISOString()}
              onPress={() => setDiaSeleccionado(dia)}
              style={[styles.diaChip, selected && styles.diaChipSelected]}
            >
              <MutedText style={selected && styles.diaChipTextSelected}>
                {DIA_LABEL[dia.getDay()]}
              </MutedText>
              <AppText variant="bodyMedium" style={selected && styles.diaChipTextSelected}>
                {dia.getDate()}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      {loadingTurnos ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : turnos && turnos.length === 0 ? (
        <MutedText style={styles.aviso}>No tenés turnos para este día.</MutedText>
      ) : (
        turnos?.map((turno) => {
          const meta = ESTADO_META[turno.estado];
          return (
            <View key={turno.id} style={styles.card}>
              <MutedText style={styles.hora}>
                {new Date(turno.fecha_hora).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </MutedText>
              <View style={styles.cardBody}>
                <View style={styles.cardIcon} />
                <View style={styles.cardText}>
                  <AppText variant="bodyMedium">
                    {turno.pets?.nombre ?? 'Mascota'} · {turno.profiles?.nombre ?? 'Dueño'}
                  </AppText>
                  {turno.tipo_servicio && <MutedText>{turno.tipo_servicio}</MutedText>}
                </View>
                <View style={[styles.badge, { backgroundColor: meta.bg }]}>
                  <AppText variant="caption" style={{ color: meta.text, fontWeight: '700' }}>
                    {meta.label}
                  </AppText>
                </View>
              </View>
              {turno.estado === 'pendiente' && (
                <View style={styles.actions}>
                  <Button
                    label="Confirmar"
                    onPress={() =>
                      updateStatus.mutate({ appointmentId: turno.id, estado: 'confirmado' })
                    }
                    style={styles.actionButton}
                  />
                  <Button
                    label="Cancelar"
                    variant="danger"
                    onPress={() =>
                      updateStatus.mutate({ appointmentId: turno.id, estado: 'cancelado' })
                    }
                    style={styles.actionButton}
                  />
                </View>
              )}
            </View>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
  title: {
    marginTop: spacing.xl,
  },
  subtitle: {
    marginBottom: spacing.md,
    textTransform: 'capitalize',
  },
  aviso: {
    marginVertical: spacing.md,
  },
  diasRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  diaChip: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  diaChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  diaChipTextSelected: {
    color: colors.white,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  hora: {
    fontSize: 12,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  badge: {
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
