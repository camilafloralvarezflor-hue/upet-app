import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { AppText, MutedText } from './Typography';
import { colors, spacing } from '../theme/tokens';

interface TabBarIconProps {
  icon: IconName;
  label: string;
  focused: boolean;
  activeColor?: string;
  activeBg?: string;
}

export function TabBarIcon({
  icon,
  label,
  focused,
  activeColor = colors.primary,
  activeBg = colors.primaryLight,
}: TabBarIconProps) {
  return (
    <View style={[styles.wrap, focused && { backgroundColor: activeBg }]}>
      <Icon name={icon} size={21} color={focused ? activeColor : colors.textFaint} strokeWidth={1.8} />
      {focused ? (
        <AppText variant="caption" style={[styles.label, { color: activeColor, fontWeight: '700' }]}>
          {label}
        </AppText>
      ) : (
        <MutedText style={styles.label}>{label}</MutedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
  },
  label: {
    fontSize: 10.5,
  },
});
