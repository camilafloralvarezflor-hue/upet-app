import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '../../../src/components/Screen';
import { AppText, Heading2, MutedText } from '../../../src/components/Typography';
import { useAppointment } from '../../../src/hooks/useAppointments';
import { useProfile } from '../../../src/hooks/useProfile';
import { useWalkLocationPublisher, useWalkTrail } from '../../../src/hooks/useWalkTracking';
import { colors, radii, spacing } from '../../../src/theme/tokens';

export default function TurnoEnVivoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: turno, isLoading } = useAppointment(id);
  const { data: profile } = useProfile();

  if (isLoading || !turno || !profile) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const esPaseador = profile.role === 'empresa';

  return (
    <Screen style={esPaseador ? undefined : styles.screenSinPadding}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={esPaseador ? undefined : styles.backFloating}>
        <AppText variant="h3" style={!esPaseador && styles.backFloatingText}>
          ‹
        </AppText>
      </Pressable>

      {esPaseador ? (
        <VistaPaseador appointmentId={turno.id} enCurso={turno.estado === 'en_curso'} />
      ) : (
        <VistaDueno appointmentId={turno.id} enCurso={turno.estado === 'en_curso'} petName={turno.pets?.nombre} />
      )}
    </Screen>
  );
}

function VistaPaseador({ appointmentId, enCurso }: { appointmentId: string; enCurso: boolean }) {
  const { compartiendo, error } = useWalkLocationPublisher(appointmentId, enCurso);

  return (
    <View style={styles.publisherBody}>
      <Heading2 style={styles.title}>
        {enCurso ? 'Paseo en curso' : 'Este paseo ya no está en curso'}
      </Heading2>
      {enCurso ? (
        <>
          <View style={[styles.dot, compartiendo && styles.dotActive]} />
          <MutedText style={styles.centrado}>
            {compartiendo
              ? 'Estamos compartiendo tu ubicación en vivo con el dueño.'
              : 'Activando la ubicación…'}
          </MutedText>
          {error && <MutedText style={styles.error}>{error}</MutedText>}
          <MutedText style={styles.centrado}>
            Mantené esta pantalla abierta mientras dure el paseo. Podés finalizarlo desde la
            pantalla de Turnos.
          </MutedText>
        </>
      ) : (
        <MutedText style={styles.centrado}>
          El tracking en vivo solo está activo mientras el turno está en curso.
        </MutedText>
      )}
    </View>
  );
}

function VistaDueno({
  appointmentId,
  enCurso,
  petName,
}: {
  appointmentId: string;
  enCurso: boolean;
  petName?: string;
}) {
  const puntos = useWalkTrail(appointmentId);
  const ultimo = puntos[puntos.length - 1];

  if (!enCurso && puntos.length === 0) {
    return (
      <View style={styles.publisherBody}>
        <Heading2 style={styles.title}>Sin recorrido todavía</Heading2>
        <MutedText style={styles.centrado}>
          El tracking en vivo se activa apenas el paseador arranca el paseo.
        </MutedText>
      </View>
    );
  }

  if (!ultimo) {
    return (
      <View style={styles.publisherBody}>
        <ActivityIndicator color={colors.primary} />
        <MutedText style={styles.centrado}>Esperando la primera ubicación del paseador…</MutedText>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: ultimo.lat,
          longitude: ultimo.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        region={{
          latitude: ultimo.lat,
          longitude: ultimo.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {puntos.length > 1 && (
          <Polyline
            coordinates={puntos.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
            strokeColor={colors.primary}
            strokeWidth={4}
          />
        )}
        <Marker
          coordinate={{ latitude: ultimo.lat, longitude: ultimo.lng }}
          title={petName ? `Paseando a ${petName}` : 'Paseador'}
        />
      </MapView>

      <View style={styles.overlay}>
        <AppText variant="bodyMedium">
          {enCurso ? `${petName ?? 'Tu mascota'} está de paseo` : 'El paseo ya terminó'}
        </AppText>
        <MutedText>Última actualización: {new Date(ultimo.recorded_at).toLocaleTimeString('es-AR')}</MutedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
  screenSinPadding: {
    padding: 0,
  },
  title: {
    textAlign: 'center',
  },
  centrado: {
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
  publisherBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  backFloating: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.md,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backFloatingText: {
    color: colors.textDark,
  },
  overlay: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 2,
  },
});
