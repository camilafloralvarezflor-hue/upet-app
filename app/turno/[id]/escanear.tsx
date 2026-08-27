import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../../src/components/Button';
import { Icon } from '../../../src/components/Icon';
import { Screen } from '../../../src/components/Screen';
import { AppText, MutedText } from '../../../src/components/Typography';
import { useConfirmarCheckin } from '../../../src/hooks/useAppointments';
import { colors, radii, spacing } from '../../../src/theme/tokens';

export default function EscanearCheckinScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const confirmarCheckin = useConfirmarCheckin(id);
  const [escaneando, setEscaneando] = useState(true);

  const handleScanned = (result: { data: string }) => {
    if (!escaneando) return;
    setEscaneando(false);

    confirmarCheckin.mutate(result.data.trim(), {
      onSuccess: () => {
        router.replace(`/turno/${id}/en-vivo`);
      },
      onError: (error) => {
        Alert.alert('No pudimos iniciar el paseo', error instanceof Error ? error.message : 'Probá de nuevo.', [
          { text: 'Reintentar', onPress: () => setEscaneando(true) },
        ]);
      },
    });
  };

  if (!permission) {
    return <Screen style={styles.screenDark} />;
  }

  if (!permission.granted) {
    return (
      <Screen style={styles.screenDark}>
        <View style={styles.permisoBody}>
          <Icon name="camera" size={32} color={colors.brand200} strokeWidth={1.6} />
          <AppText variant="bodyMedium" style={styles.permisoTitulo}>
            Necesitamos la cámara
          </AppText>
          <MutedText style={styles.permisoTexto}>
            Para escanear el código del paseador y arrancar el paseo.
          </MutedText>
          <Button label="Dar permiso" onPress={requestPermission} variant="dark" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={escaneando ? handleScanned : undefined}
      />
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
        <Icon name="chevronLeft" size={18} color={colors.white} strokeWidth={2.75} />
      </Pressable>
      <View style={styles.frame} pointerEvents="none" />
      <View style={styles.hint}>
        <MutedText style={styles.hintText}>Apuntá al código que te muestra el paseador</MutedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 0,
    backgroundColor: '#000',
  },
  screenDark: {
    backgroundColor: colors.brand900,
  },
  permisoBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  permisoTitulo: {
    color: colors.onDark,
    marginTop: spacing.sm,
  },
  permisoTexto: {
    color: colors.onDarkMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(32,30,29,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: colors.brand200,
    borderRadius: radii.lg,
  },
  hint: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  hintText: {
    color: colors.white,
    textAlign: 'center',
  },
});
