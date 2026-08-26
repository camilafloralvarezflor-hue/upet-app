import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Icon, type IconName } from './Icon';
import { colors, fonts, radii, spacing } from '../theme/tokens';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'dark' | 'secondary' | 'danger';
  icon?: IconName;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', icon, disabled, style }: ButtonProps) {
  const variantStyle = disabled ? disabledStyle : variantStyles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle.container,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && <Icon name={icon} size={17} color={variantStyle.label.color} strokeWidth={2} />}
        <Text style={[styles.label, variantStyle.label]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const variantStyles: Record<
  NonNullable<ButtonProps['variant']>,
  { container: ViewStyle; label: { color: string } }
> = {
  primary: {
    container: { backgroundColor: colors.brand900 },
    label: { color: colors.onDark },
  },
  dark: {
    container: { backgroundColor: colors.brand900 },
    label: { color: colors.onDark },
  },
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.brand900,
    },
    label: { color: colors.brand900 },
  },
  danger: {
    container: { backgroundColor: colors.alert500 },
    label: { color: colors.white },
  },
};

const disabledStyle = {
  container: { backgroundColor: colors.bgNeutral },
  label: { color: colors.textFainter },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    paddingVertical: spacing.md - 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.85,
  },
});
