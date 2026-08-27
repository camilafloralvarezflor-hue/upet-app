import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppSwitch } from '../../src/components/AppSwitch';
import { Icon } from '../../src/components/Icon';
import { Screen } from '../../src/components/Screen';
import { AppText, MutedText } from '../../src/components/Typography';
import { useMyBusiness, useUpdateBusiness } from '../../src/hooks/useBusiness';
import { useCobrarYa, useGanancias } from '../../src/hooks/useGanancias';
import { useReviews } from '../../src/hooks/useReviews';
import { colors, radii, spacing } from '../../src/theme/tokens';

export default function GananciasScreen() {
  const router = useRouter();
  const { data: business, isLoading: loadingBusiness } = useMyBusiness();
  const { data: ganancias, isLoading } = useGanancias(business?.id);
  const { stats: reviewStats } = useReviews(business?.id);
  const cobrarYa = useCobrarYa(business?.id);
  const updateBusiness = useUpdateBusiness(business?.id ?? '');

  if (loadingBusiness || isLoading || !ganancias || !business) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand900} />
        </View>
      </Screen>
    );
  }

  const maximo = Math.max(...ganancias.porDia.map((d) => d.neto), 1);

  const handleCobrar = () => {
    if (ganancias.totalNeto <= 0) return;
    cobrarYa.mutate(ganancias.totalNeto, {
      onSuccess: () =>
        Alert.alert(
          'Listo',
          'Pedimos el cobro. TODO(pagos): esto todavía no dispara una transferencia real — ver src/lib/comision.ts.'
        ),
    });
  };

  const toggleDisponibilidad = (campo: 'mananas' | 'tardes' | 'finde', valor: boolean) => {
    updateBusiness.mutate({ disponibilidad: { ...business.disponibilidad, [campo]: valor } });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Icon name="chevronLeft" size={18} color={colors.textDark} strokeWidth={2.75} />
        </Pressable>
        <AppText variant="display" style={styles.title}>
          Ganancias
        </AppText>
      </View>

      <View style={styles.card}>
        <MutedText style={styles.cardMuted}>Esta semana</MutedText>
        <AppText variant="display" style={styles.total}>
          ${ganancias.totalNeto.toLocaleString('es-AR')}
        </AppText>

        <View style={styles.chart}>
          {ganancias.porDia.map((dia, index) => (
            <View key={index} style={styles.chartCol}>
              <View style={styles.chartTrack}>
                <View
                  style={[
                    styles.chartBar,
                    { height: `${Math.max((dia.neto / maximo) * 100, 4)}%` },
                    dia.neto === maximo && dia.neto > 0 && styles.chartBarDestacada,
                  ]}
                />
              </View>
              <MutedText style={styles.chartLabel}>{dia.label}</MutedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatBox valor={ganancias.paseos} label="paseos" />
        <StatBox
          valor={reviewStats.total > 0 ? reviewStats.promedio.toFixed(1) : '—'}
          label="puntaje"
        />
        <StatBox valor={ganancias.cancelados} label="cancelados" />
      </View>

      <View style={styles.cobrarCard}>
        <View style={styles.cobrarText}>
          <AppText variant="bodyMedium" style={styles.cobrarTitulo}>
            Cobrás el lunes
          </AppText>
          <MutedText style={styles.cobrarSubtitulo}>
            ${ganancias.totalNeto.toLocaleString('es-AR')}
            {business.cbu_alias ? ` a ${business.cbu_alias}` : ' · cargá tu CBU/alias en tu perfil'}
          </MutedText>
        </View>
        <Pressable onPress={handleCobrar} style={styles.cobrarButton} disabled={cobrarYa.isPending}>
          <AppText variant="bodyMedium" style={styles.cobrarButtonText}>
            {cobrarYa.isPending ? 'Enviando…' : 'Cobrar ya'}
          </AppText>
        </Pressable>
      </View>

      <AppText variant="label" style={styles.disponibilidadLabel}>
        Disponibilidad
      </AppText>
      <View style={styles.disponibilidadCard}>
        <DisponibilidadRow
          label="Mañanas · 8 a 12"
          value={business.disponibilidad.mananas}
          onValueChange={(v) => toggleDisponibilidad('mananas', v)}
        />
        <DisponibilidadRow
          label="Tardes · 14 a 20"
          value={business.disponibilidad.tardes}
          onValueChange={(v) => toggleDisponibilidad('tardes', v)}
        />
        <DisponibilidadRow
          label="Fines de semana"
          value={business.disponibilidad.finde}
          onValueChange={(v) => toggleDisponibilidad('finde', v)}
          ultima
        />
      </View>
    </Screen>
  );
}

function StatBox({ valor, label }: { valor: string | number; label: string }) {
  return (
    <View style={styles.statBox}>
      <AppText variant="h2" style={styles.statValor}>
        {valor}
      </AppText>
      <MutedText style={styles.statLabel}>{label}</MutedText>
    </View>
  );
}

function DisponibilidadRow({
  label,
  value,
  onValueChange,
  ultima,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  ultima?: boolean;
}) {
  return (
    <View style={[styles.dispRow, !ultima && styles.dispRowBorder]}>
      <AppText variant="body" style={!value && styles.dispLabelApagado}>
        {label}
      </AppText>
      <AppSwitch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
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
  card: {
    backgroundColor: colors.brand900,
    borderRadius: radii.xl + 2,
    padding: spacing.md + 4,
    marginBottom: spacing.md - 2,
  },
  cardMuted: {
    color: colors.onDarkMuted,
    fontSize: 12,
  },
  total: {
    color: colors.onDark,
    fontSize: 34,
    marginTop: 3,
    marginBottom: 2,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    height: 96,
    marginTop: spacing.md + 4,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs + 2,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    backgroundColor: colors.brandDark,
    borderRadius: 8,
  },
  chartBarDestacada: {
    backgroundColor: colors.brandCircleFaint,
  },
  chartLabel: {
    color: colors.onDarkMuted,
    fontSize: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md - 2,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border300,
    borderRadius: radii.lg,
    padding: spacing.md - 2,
  },
  statValor: {
    color: colors.brand700,
    fontSize: 20,
  },
  statLabel: {
    fontSize: 11.5,
    marginTop: 2,
  },
  cobrarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    backgroundColor: colors.brandLightBg,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cobrarText: {
    flex: 1,
  },
  cobrarTitulo: {
    color: colors.brandDark,
  },
  cobrarSubtitulo: {
    color: colors.brand700,
    fontSize: 11.5,
    marginTop: 1,
  },
  cobrarButton: {
    backgroundColor: colors.brand900,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md - 1,
  },
  cobrarButtonText: {
    color: colors.onDark,
    fontSize: 12.5,
  },
  disponibilidadLabel: {
    marginBottom: spacing.sm + 2,
  },
  disponibilidadCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border300,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
  },
  dispRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 3,
  },
  dispRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(32,30,29,0.08)',
  },
  dispLabelApagado: {
    color: colors.textMuted,
  },
});
