import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { Screen } from '../../src/components/Screen';
import { AppText, Heading1, Heading3, MutedText } from '../../src/components/Typography';
import { useEmergencyContacts } from '../../src/hooks/useEmergencyContacts';
import { useUserLocation } from '../../src/hooks/useUserLocation';
import { colors, radii, spacing } from '../../src/theme/tokens';
import { distanciaKm, formatDistancia } from '../../src/lib/geo';
import type { EmergencyContact } from '../../src/lib/database.types';

export default function EmergenciasScreen() {
  const { data: contactos, isLoading } = useEmergencyContacts();
  const { coords } = useUserLocation();

  const ordenados = [...(contactos ?? [])].sort((a, b) => {
    if (!coords || a.lat == null || a.lng == null) return 1;
    if (b.lat == null || b.lng == null) return -1;
    const distanciaA = distanciaKm(coords.lat, coords.lng, a.lat, a.lng);
    const distanciaB = distanciaKm(coords.lat, coords.lng, b.lat, b.lng);
    return distanciaA - distanciaB;
  });

  return (
    <Screen>
      <Heading1 style={styles.title}>Emergencias</Heading1>
      <MutedText style={styles.subtitle}>Guardias veterinarias 24 hs cerca tuyo</MutedText>

      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Icon name="shieldAlert" size={19} color={colors.white} strokeWidth={2} />
        </View>
        <MutedText style={styles.bannerText}>
          ¿Es una urgencia? Elegí una guardia y llamá directo, sin buscar en internet.
        </MutedText>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : ordenados.length === 0 ? (
        <MutedText style={styles.empty}>
          Todavía no hay guardias de emergencia cargadas en tu zona.
        </MutedText>
      ) : (
        ordenados.map((contacto) => (
          <EmergencyCard
            key={contacto.id}
            contacto={contacto}
            distanciaKm={
              coords && contacto.lat != null && contacto.lng != null
                ? distanciaKm(coords.lat, coords.lng, contacto.lat, contacto.lng)
                : null
            }
          />
        ))
      )}
    </Screen>
  );
}

function EmergencyCard({
  contacto,
  distanciaKm: distancia,
}: {
  contacto: EmergencyContact;
  distanciaKm: number | null;
}) {
  const es24hs = contacto.horario_guardia?.trim().toLowerCase() === '24 hs';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Heading3 style={styles.cardName}>{contacto.nombre}</Heading3>
        {contacto.horario_guardia && (
          <View style={[styles.badge, es24hs ? styles.badgePrimary : styles.badgeAmber]}>
            <AppText
              variant="caption"
              style={es24hs ? styles.badgeTextPrimary : styles.badgeTextAmber}
            >
              {contacto.horario_guardia}
            </AppText>
          </View>
        )}
      </View>

      {contacto.especialidad && <MutedText style={styles.especialidad}>{contacto.especialidad}</MutedText>}

      <View style={styles.direccionRow}>
        <Icon name="locationPin" size={14} color={colors.textFaint} strokeWidth={2} />
        <MutedText style={styles.direccionText}>
          {contacto.direccion}
          {distancia != null ? ` · ${formatDistancia(distancia)}` : ''}
        </MutedText>
      </View>

      <Button
        label="Llamar ahora"
        variant="dark"
        icon="phone"
        onPress={() => Linking.openURL(`tel:${contacto.telefono}`)}
        style={styles.callButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 4,
    backgroundColor: colors.dangerBg,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.dangerText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    color: '#8C491A',
    fontSize: 13,
    lineHeight: 19,
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  especialidad: {
    fontSize: 12.5,
  },
  direccionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  direccionText: {
    fontSize: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardName: {
    flex: 1,
  },
  badge: {
    borderRadius: radii.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  badgePrimary: {
    backgroundColor: colors.primaryLight,
  },
  badgeAmber: {
    backgroundColor: colors.amberBg,
  },
  badgeTextPrimary: {
    color: colors.primary,
    fontWeight: '700',
  },
  badgeTextAmber: {
    color: colors.amber,
    fontWeight: '700',
  },
  callButton: {
    marginTop: spacing.sm,
  },
});
