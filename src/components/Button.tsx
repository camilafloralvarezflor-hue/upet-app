import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, fonts, radii, spacing } from '../theme/tokens';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  const variantStyle = variantStyles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle.container,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, variantStyle.label]}>{label}</Text>
    </Pressable>
  );
}

const variantStyles: Record<
  NonNullable<ButtonProps['variant']>,
  { container: ViewStyle; label: { color: string } }
> = {
  primary: {
    container: { backgroundColor: colors.primary },
    label: { color: colors.white },
  },
  secondary: {
    container: {
      backgroundColor: colors.cream,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: { color: colors.textDark },
  },
  gold: {
    container: { backgroundColor: colors.gold },
    label: { color: colors.textDark },
  },
  danger: {
    container: {
      backgroundColor: colors.dangerBg,
      borderWidth: 1,
      borderColor: colors.dangerText,
    },
    label: { color: colors.dangerText },
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
