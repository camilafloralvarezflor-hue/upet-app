import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Icon } from '../../../src/components/Icon';
import { Screen } from '../../../src/components/Screen';
import { AppText, MutedText } from '../../../src/components/Typography';
import { useAppointment, useIniciarCheckin, useUpdateAppointmentStatus } from '../../../src/hooks/useAppointments';
import { useMyBusiness } from '../../../src/hooks/useBusiness';
import { iniciarTrackingEnSegundoPlano } from '../../../src/lib/background-location-task';
import { supabase } from '../../../src/lib/supabase';
import { colors, radii, spacing } from '../../../src/theme/tokens';

export default function CheckinScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: turno, isLoading } = useAppointment(id);
  const { data: business } = useMyBusiness();
  const iniciarCheckin = useIniciarCheckin(id);
  const updateStatus = useUpdateAppointmentStatus(business?.id);
  const [codigo, setCodigo] = useState<string | null>(null);
  const yaArranco = useRef(false);

  useEffect(() => {
    if (!id) return;
    iniciarCheckin.mutateAsync().then(setCodigo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`appointment-checkin:${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'appointments', filter: `id=eq.${id}` },
        async (payload) => {
          const nuevoEstado = (payload.new as { estado?: string }).estado;
          if (nuevoEstado === 'en_curso' && !yaArranco.current) {
            yaArranco.current = true;
            const resultado = await iniciarTrackingEnSegundoPlano(id);
            if (!resultado.ok) {
              Alert.alert(
                'El dueño ya escaneó el código',
                'Pero no pudimos activar tu ubicación en este dispositivo. Activá el permiso de ubicación "Permitir siempre" y volvé a intentar desde Turnos.'
              );
            }
            router.replace(`/turno/${id}/en-vivo`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, router]);

  const handleIniciarSinEscanear = async () => {
    if (yaArranco.current) return;
    yaArranco.current = true;
    await iniciarTrackingEnSegundoPlano(id);
    updateStatus.mutate({ appointmentId: id, estado: 'en_curso' });
    router.replace(`/turno/${id}/en-vivo`);
  };

  if (isLoading || !turno) {
    return (
      <Screen style={styles.screenDark}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand200} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screenDark}>
      <View style={styles.decorativeCircle} pointerEvents="none" />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Icon name="chevronLeft" size={18} color={colors.onDark} strokeWidth={2.75} />
        </Pressable>
        <AppText variant="bodyMedium" style={styles.headerTitle}>
          Check-in del paseo
        </AppText>
      </View>

      <AppText variant="display" style={styles.title}>
        Mostrale este código al dueño
      </AppText>
      <MutedText style={styles.subtitle}>
        Al escanearlo arranca el timer, se activa el seguimiento en vivo y queda registrada la hora
        de salida.
      </MutedText>

      <View style={styles.qrCard}>
        {codigo ? (
          <QRCode value={codigo} size={192} color={colors.textDark} backgroundColor={colors.bgApp} />
        ) : (
          <ActivityIndicator color={colors.brand900} />
        )}
      </View>
      {codigo && (
        <AppText variant="code" style={styles.codigoTexto}>
          {codigo}
        </AppText>
      )}

      <View style={styles.footer}>
        <View style={styles.petCard}>
          <View style={styles.petIcon}>
            <Icon name="paw" size={18} color={colors.brand200} strokeWidth={1.8} />
          </View>
          <View style={styles.petText}>
            <AppText variant="bodyMedium" style={styles.petName}>
              {turno.pets?.nombre ?? 'Mascota'}
            </AppText>
            {turno.tipo_servicio && <MutedText style={styles.petSubtitle}>{turno.tipo_servicio}</MutedText>}
          </View>
        </View>
        <Pressable onPress={handleIniciarSinEscanear} style={styles.fallbackButton}>
          <AppText variant="bodyMedium" style={styles.fallbackText}>
            El dueño no está — iniciar sin escanear
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenDark: {
    backgroundColor: colors.brand900,
    flex: 1,
  },
  loading: {
    marginTop: spacing.xl,
  },
  decorativeCircle: {
    position: 'absolute',
    right: -70,
    top: 260,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#313A22',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    color: colors.onDark,
  },
  title: {
    color: colors.onDark,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: 'rgba(245,234,216,0.65)',
    fontSize: 13,
    maxWidth: 290,
  },
  qrCard: {
    marginTop: spacing.xl,
    alignSelf: 'center',
    width: 236,
    height: 236,
    backgroundColor: colors.bgApp,
    borderRadius: radii.xl + 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codigoTexto: {
    textAlign: 'center',
    marginTop: spacing.md,
    letterSpacing: 2,
    color: colors.brandCircleFaint,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.lg,
    gap: spacing.sm + 4,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    backgroundColor: colors.brandDark,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  petIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: '#4A5533',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petText: {
    flex: 1,
  },
  petName: {
    color: colors.onDark,
  },
  petSubtitle: {
    color: colors.onDarkMuted,
    fontSize: 11.5,
  },
  fallbackButton: {
    borderWidth: 1,
    borderColor: 'rgba(245,234,216,0.28)',
    borderRadius: radii.pill,
    padding: spacing.md - 1,
    alignItems: 'center',
  },
  fallbackText: {
    color: colors.onDark,
  },
});
