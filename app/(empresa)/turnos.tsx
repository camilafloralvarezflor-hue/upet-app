import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { AppText, Heading1, MutedText } from '../../src/components/Typography';
import { useMyBusiness } from '../../src/hooks/useBusiness';
import {
  useAppointmentsForBusiness,
  useFinalizarServicio,
  useUpdateAppointmentStatus,
  type AppointmentWithDetalle,
} from '../../src/hooks/useAppointments';
import {
  detenerTrackingEnSegundoPlano,
  iniciarTrackingEnSegundoPlano,
} from '../../src/lib/background-location-task';
import { calcularNeto } from '../../src/lib/comision';
import { proximosDias } from '../../src/lib/turnos-slots';
import { colors, radii, spacing } from '../../src/theme/tokens';
import type { AppointmentStatus } from '../../src/lib/database.types';

const DIA_LABEL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ESTADO_META: Record<AppointmentStatus, { label: string; bg: string; text: string }> = {
  pendiente: { label: 'Pendiente', bg: '#FCEFDA', text: '#7A5416' },
  confirmado: { label: 'Confirmado', bg: '#EAF3F0', text: '#2E6F5E' },
  en_curso: { label: 'En curso', bg: '#EAF3F0', text: '#2E6F5E' },
  completado: { label: 'Completado', bg: '#E4E0D8', text: '#5B6B65' },
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
  const finalizarServicio = useFinalizarServicio(business?.id);
  const [finalizandoId, setFinalizandoId] = useState<string | null>(null);
  const [monto, setMonto] = useState('');

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

  const handleIniciarPaseo = async (appointmentId: string) => {
    const resultado = await iniciarTrackingEnSegundoPlano(appointmentId);
    if (!resultado.ok) {
      Alert.alert(
        'No pudimos activar tu ubicación',
        resultado.motivo === 'foreground_denegado'
          ? 'Necesitamos permiso de ubicación para compartir el recorrido con el dueño.'
          : 'Para que el dueño te vea en el mapa incluso con el celular bloqueado, activá "Permitir siempre" en Ajustes > Mawis > Ubicación.'
      );
      return;
    }
    updateStatus.mutate({ appointmentId, estado: 'en_curso' });
  };

  const handleFinalizar = async (appointmentId: string) => {
    const montoNumero = Number(monto.replace(',', '.'));
    if (!montoNumero || montoNumero <= 0) return;
    await finalizarServicio.mutateAsync({ appointmentId, monto: montoNumero });
    await detenerTrackingEnSegundoPlano();
    setFinalizandoId(null);
    setMonto('');
  };

  const esHoy = diaSeleccionado.toDateString() === new Date().toDateString();

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Heading1 style={styles.title}>Turnos</Heading1>
          <MutedText style={styles.subtitle}>
            {esHoy ? 'Hoy, ' : ''}
            {diaSeleccionado.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
          </MutedText>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.diasRow}>
        {dias.map((dia) => {
          const selected = dia.toDateString() === diaSeleccionado.toDateString();
          return (
            <Pressable
              key={dia.toISOString()}
              onPress={() => setDiaSeleccionado(dia)}
              style={[styles.diaChip, selected && styles.diaChipSelected]}
            >
              <MutedText style={[styles.diaLabel, selected && styles.diaChipTextSelected]}>
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
        turnos?.map((turno) => (
          <TurnoCard
            key={turno.id}
            turno={turno}
            finalizando={finalizandoId === turno.id}
            monto={monto}
            onMontoChange={setMonto}
            onConfirmar={() => updateStatus.mutate({ appointmentId: turno.id, estado: 'confirmado' })}
            onCancelar={() => updateStatus.mutate({ appointmentId: turno.id, estado: 'cancelado' })}
            onIniciar={() => handleIniciarPaseo(turno.id)}
            onVerRecorrido={() => router.push(`/turno/${turno.id}/en-vivo`)}
            onEmpezarFinalizar={() => {
              setFinalizandoId(turno.id);
              setMonto('');
            }}
            onCancelarFinalizar={() => setFinalizandoId(null)}
            onConfirmarFinalizar={() => handleFinalizar(turno.id)}
            guardando={finalizarServicio.isPending}
          />
        ))
      )}
    </Screen>
  );
}

function TurnoCard({
  turno,
  finalizando,
  monto,
  onMontoChange,
  onConfirmar,
  onCancelar,
  onIniciar,
  onVerRecorrido,
  onEmpezarFinalizar,
  onCancelarFinalizar,
  onConfirmarFinalizar,
  guardando,
}: {
  turno: AppointmentWithDetalle;
  finalizando: boolean;
  monto: string;
  onMontoChange: (v: string) => void;
  onConfirmar: () => void;
  onCancelar: () => void;
  onIniciar: () => void;
  onVerRecorrido: () => void;
  onEmpezarFinalizar: () => void;
  onCancelarFinalizar: () => void;
  onConfirmarFinalizar: () => void;
  guardando: boolean;
}) {
  const meta = ESTADO_META[turno.estado];
  const desglose =
    turno.estado === 'completado' && turno.monto != null && turno.comision_pct != null
      ? calcularNeto(turno.monto, turno.comision_pct)
      : null;

  return (
    <View style={styles.row}>
      <MutedText style={styles.hora}>
        {new Date(turno.fecha_hora).toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </MutedText>
      <View style={styles.card}>
        <View style={styles.cardBody}>
          <View style={styles.cardIcon}>
            <Icon name="paw" size={18} color={colors.primary} strokeWidth={1.8} />
          </View>
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
          <Button label="Confirmar" onPress={onConfirmar} style={styles.actionButton} />
          <Button label="Cancelar" variant="danger" onPress={onCancelar} style={styles.actionButton} />
        </View>
      )}

      {turno.estado === 'confirmado' && (
        <Button label="Iniciar paseo" onPress={onIniciar} />
      )}

      {turno.estado === 'en_curso' && !finalizando && (
        <View style={styles.actions}>
          <Button label="Ver recorrido en vivo" onPress={onVerRecorrido} style={styles.actionButton} />
          <Button
            label="Finalizar paseo"
            variant="secondary"
            onPress={onEmpezarFinalizar}
            style={styles.actionButton}
          />
        </View>
      )}

      {turno.estado === 'en_curso' && finalizando && (
        <View style={styles.finalizarForm}>
          <TextField
            label="¿Cuánto cobraste por este servicio?"
            value={monto}
            onChangeText={onMontoChange}
            placeholder="Ej. 5000"
            keyboardType="decimal-pad"
          />
          <View style={styles.actions}>
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={onCancelarFinalizar}
              style={styles.actionButton}
            />
            <Button
              label={guardando ? 'Guardando…' : 'Confirmar cobro'}
              onPress={onConfirmarFinalizar}
              disabled={guardando}
              style={styles.actionButton}
            />
          </View>
        </View>
      )}

        {desglose && (
          <View style={styles.desglose}>
            <MutedText>Cobraste ${turno.monto?.toFixed(2)}</MutedText>
            <MutedText>Comisión Mawis ({turno.comision_pct}%): ${desglose.comision.toFixed(2)}</MutedText>
            <AppText variant="bodyMedium">Neto para vos: ${desglose.neto.toFixed(2)}</AppText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  title: {
    marginTop: 0,
  },
  subtitle: {
    marginTop: 2,
    marginBottom: spacing.md,
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
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginRight: spacing.xs,
  },
  diaChipSelected: {
    backgroundColor: colors.textDark,
  },
  diaLabel: {
    fontSize: 10.5,
  },
  diaChipTextSelected: {
    color: colors.cream,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
    marginBottom: spacing.sm + 2,
  },
  hora: {
    width: 44,
    flexShrink: 0,
    textAlign: 'right',
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textDark,
    paddingTop: 14,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
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
  finalizarForm: {
    gap: spacing.sm,
  },
  desglose: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 2,
  },
});
