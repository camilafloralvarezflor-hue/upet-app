import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '../../src/components/Screen';
import { AppText, MutedText } from '../../src/components/Typography';
import { VaccineStatusBadge } from '../../src/components/VaccineStatusBadge';
import { usePet } from '../../src/hooks/usePets';
import { useVaccines } from '../../src/hooks/useVaccines';
import { colors, radii, spacing } from '../../src/theme/tokens';
import { computeVaccineStatus, diasHasta, formatFechaEs } from '../../src/lib/vaccine-status';
import type { Vaccine } from '../../src/lib/database.types';

type Tab = 'carnet' | 'turnos' | 'notas';

export default function PerfilMascotaDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: pet, isLoading } = usePet(id);
  const { data: vaccines } = useVaccines(id);
  const [tab, setTab] = useState<Tab>('carnet');

  const proximaVacuna = useMemo(() => {
    if (!vaccines) return null;
    const proximas = vaccines
      .filter((v) => v.proxima_fecha && computeVaccineStatus(v.proxima_fecha) !== 'al_dia')
      .sort((a, b) => (a.proxima_fecha! > b.proxima_fecha! ? 1 : -1));
    return proximas[0] ?? null;
  }, [vaccines]);

  if (isLoading || !pet) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <AppText variant="h3">‹</AppText>
        </Pressable>
        <AppText variant="bodyMedium" style={styles.headerTitle}>
          Mi mascota
        </AppText>
        <Pressable onPress={() => router.push(`/mascota/${id}/editar`)} hitSlop={12}>
          <MutedText>Editar</MutedText>
        </Pressable>
      </View>

      {pet.foto_url ? (
        <Image source={{ uri: pet.foto_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}

      <AppText variant="h2" style={styles.name}>
        {pet.nombre}
      </AppText>

      <View style={styles.chips}>
        {pet.raza && <Chip label={pet.raza} />}
        {pet.edad != null && <Chip label={`${pet.edad} años`} />}
        {pet.peso != null && <Chip label={`${pet.peso} kg`} />}
      </View>

      <View style={styles.tabs}>
        <TabButton label="Carnet" active={tab === 'carnet'} onPress={() => setTab('carnet')} />
        <TabButton label="Turnos" active={tab === 'turnos'} onPress={() => setTab('turnos')} />
        <TabButton label="Notas" active={tab === 'notas'} onPress={() => setTab('notas')} />
      </View>
      <View style={styles.tabsDivider} />

      {tab === 'carnet' && (
        <View style={styles.carnet}>
          {proximaVacuna?.proxima_fecha && (
            <View style={styles.alert}>
              <MutedText style={styles.alertText}>
                {computeVaccineStatus(proximaVacuna.proxima_fecha) === 'vencida'
                  ? `La vacuna ${proximaVacuna.nombre.toLowerCase()} está vencida`
                  : `La vacuna ${proximaVacuna.nombre.toLowerCase()} vence en ${diasHasta(
                      proximaVacuna.proxima_fecha
                    )} días`}
              </MutedText>
            </View>
          )}

          {vaccines?.map((vaccine) => (
            <VaccineRow key={vaccine.id} vaccine={vaccine} petId={id} />
          ))}

          <Pressable
            style={styles.addVaccine}
            onPress={() => router.push(`/mascota/${id}/vacuna/nueva`)}
          >
            <AppText variant="bodyMedium" style={styles.addVaccineText}>
              + Agregar vacuna
            </AppText>
          </Pressable>
        </View>
      )}

      {tab === 'turnos' && (
        <View style={styles.emptyTab}>
          <MutedText>Los turnos de esta mascota se van a poder agendar más adelante.</MutedText>
        </View>
      )}

      {tab === 'notas' && (
        <View style={styles.emptyTab}>
          <MutedText>Todavía no hay notas para esta mascota.</MutedText>
        </View>
      )}
    </Screen>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <MutedText style={styles.chipText}>{label}</MutedText>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <AppText
        variant={active ? 'bodyMedium' : 'bodyMuted'}
        style={active ? styles.tabActive : undefined}
      >
        {label}
      </AppText>
      {active && <View style={styles.tabIndicator} />}
    </Pressable>
  );
}

function VaccineRow({ vaccine, petId }: { vaccine: Vaccine; petId: string }) {
  const router = useRouter();
  const status = vaccine.proxima_fecha ? computeVaccineStatus(vaccine.proxima_fecha) : vaccine.estado;

  return (
    <Pressable
      style={styles.vaccineRow}
      onPress={() => router.push(`/mascota/${petId}/vacuna/${vaccine.id}`)}
    >
      <View style={styles.vaccineDot} />
      <View style={styles.vaccineText}>
        <AppText variant="bodyMedium">{vaccine.nombre}</AppText>
        <MutedText style={styles.vaccineDate}>
          Aplicada {formatFechaEs(vaccine.fecha_aplicacion)}
        </MutedText>
      </View>
      <VaccineStatusBadge status={status} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  loading: {
    marginTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  headerTitle: {
    fontSize: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  name: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  chipText: {
    fontSize: 11,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  tabButton: {
    paddingBottom: spacing.sm,
  },
  tabActive: {
    color: colors.primary,
  },
  tabIndicator: {
    marginTop: spacing.xs,
    height: 2,
    width: 50,
    backgroundColor: colors.primary,
  },
  tabsDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  carnet: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  alert: {
    backgroundColor: colors.amberBg,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  alertText: {
    color: colors.amber,
    fontSize: 12.5,
  },
  vaccineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  vaccineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
  },
  vaccineText: {
    flex: 1,
    gap: 2,
  },
  vaccineDate: {
    fontSize: 11.5,
  },
  addVaccine: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  addVaccineText: {
    color: colors.primary,
  },
  emptyTab: {
    padding: spacing.lg,
  },
});
