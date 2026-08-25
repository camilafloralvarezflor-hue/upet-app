import { StyleSheet, View } from 'react-native';

import { AppText } from './Typography';
import { colors, radii, spacing } from '../theme/tokens';
import type { VaccineStatus } from '../lib/database.types';

const STATUS_META: Record<VaccineStatus, { label: string; bg: string; text: string }> = {
  proxima: { label: 'Próxima', bg: colors.amberBg, text: colors.amber },
  al_dia: { label: 'Al día', bg: colors.primaryLight, text: colors.primary },
  vencida: { label: 'Vencida', bg: colors.dangerBg, text: colors.dangerText },
};

export function VaccineStatusBadge({ status }: { status: VaccineStatus }) {
  const meta = STATUS_META[status];
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]}>
      <AppText variant="caption" style={[styles.label, { color: meta.text }]}>
        {meta.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
  },
});
