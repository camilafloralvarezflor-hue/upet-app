import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../../src/components/Button';
import { Screen } from '../../../src/components/Screen';
import { TextField } from '../../../src/components/TextField';
import { AppText, Heading2, MutedText } from '../../../src/components/Typography';
import { useBusinessDetail } from '../../../src/hooks/useBusinesses';
import { useCreateAppointment, useBookedSlots } from '../../../src/hooks/useAppointments';
import { usePets } from '../../../src/hooks/usePets';
import { proximosDias, generarSlots } from '../../../src/lib/turnos-slots';
import { colors, radii, spacing } from '../../../src/theme/tokens';

const DIA_LABEL = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export default function ReservarTurnoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: business, isLoading: loadingBusiness } = useBusinessDetail(id);
  const { data: pets, isLoading: loadingPets } = usePets();

  const dias = useMemo(() => proximosDias(7), []);
  const [diaSeleccionado, setDiaSeleccionado] = useState(dias[0]);
  const [petId, setPetId] = useState<string | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<Date | null>(null);
  const [tipoServicio, setTipoServicio] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: ocupados, isLoading: loadingOcupados } = useBookedSlots(id, diaSeleccionado);
  const createAppointment = useCreateAppointment();

  const slots = useMemo(() => {
    if (!business || !ocupados) return [];
    return generarSlots(business.horarios, diaSeleccionado, ocupados);
  }, [business, diaSeleccionado, ocupados]);

  if (loadingBusiness || loadingPets) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const handleReservar = async () => {
    if (!petId || !horaSeleccionada || !id) {
      setError('Elegí tu mascota y un horario disponible.');
      return;
    }
    setError(null);
    try {
      await createAppointment.mutateAsync({
        businessId: id,
        petId,
        fechaHora: horaSeleccionada,
        tipoServicio: tipoServicio.trim(),
      });
      router.replace('/(dueno)/turnos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos reservar el turno.');
    }
  };

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MutedText>‹ Volver</MutedText>
        </Pressable>
        <Heading2 style={styles.title}>Reservar turno</Heading2>
        <MutedText style={styles.subtitle}>{business?.nombre}</MutedText>

        {(!pets || pets.length === 0) && (
          <MutedText style={styles.aviso}>
            Necesitás tener al menos una mascota cargada para poder reservar un turno.
          </MutedText>
        )}

        {pets && pets.length > 0 && (
          <>
            <MutedText style={styles.label}>Mascota</MutedText>
            <View style={styles.chipsRow}>
              {pets.map((pet) => (
                <Pressable
                  key={pet.id}
                  onPress={() => setPetId(pet.id)}
                  style={[styles.chip, petId === pet.id && styles.chipSelected]}
                >
                  <AppText variant="bodyMuted" style={petId === pet.id && styles.chipTextSelected}>
                    {pet.nombre}
                  </AppText>
                </Pressable>
              ))}
            </View>

            <MutedText style={styles.label}>Día</MutedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.diasRow}>
              {dias.map((dia) => {
                const selected = dia.toDateString() === diaSeleccionado.toDateString();
                return (
                  <Pressable
                    key={dia.toISOString()}
                    onPress={() => {
                      setDiaSeleccionado(dia);
                      setHoraSeleccionada(null);
                    }}
                    style={[styles.diaChip, selected && styles.diaChipSelected]}
                  >
                    <MutedText style={selected && styles.diaChipTextSelected}>
                      {DIA_LABEL[dia.getDay()]}
                    </MutedText>
                    <AppText
                      variant="bodyMedium"
                      style={selected && styles.diaChipTextSelected}
                    >
                      {dia.getDate()}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>

            <MutedText style={styles.label}>Horario</MutedText>
            {loadingOcupados ? (
              <ActivityIndicator color={colors.primary} style={styles.loadingSlots} />
            ) : slots.length === 0 ? (
              <MutedText style={styles.aviso}>No hay horarios disponibles ese día.</MutedText>
            ) : (
              <View style={styles.slotsGrid}>
                {slots.map((slot) => {
                  const selected = horaSeleccionada?.getTime() === slot.getTime();
                  return (
                    <Pressable
                      key={slot.toISOString()}
                      onPress={() => setHoraSeleccionada(slot)}
                      style={[styles.slot, selected && styles.slotSelected]}
                    >
                      <MutedText style={selected && styles.slotTextSelected}>
                        {slot.getHours().toString().padStart(2, '0')}:
                        {slot.getMinutes().toString().padStart(2, '0')}
                      </MutedText>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <TextField
              label="Tipo de servicio (opcional)"
              value={tipoServicio}
              onChangeText={setTipoServicio}
              placeholder="Paseo de 30 min, cuidado por el día…"
              style={styles.tipoServicio}
            />

            {error && <MutedText style={styles.error}>{error}</MutedText>}

            <Button
              label={createAppointment.isPending ? 'Reservando…' : 'Confirmar turno'}
              onPress={handleReservar}
              disabled={createAppointment.isPending}
              style={styles.submit}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
  title: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  aviso: {
    marginVertical: spacing.md,
  },
  label: {
    fontSize: 13,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipTextSelected: {
    color: colors.white,
  },
  diasRow: {
    flexDirection: 'row',
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
  loadingSlots: {
    marginTop: spacing.sm,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slot: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotTextSelected: {
    color: colors.white,
  },
  tipoServicio: {
    marginTop: spacing.md,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
  },
  submit: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
