import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Icon, type IconName } from './Icon';
import { colors, fonts, radii, spacing } from '../theme/tokens';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'dark' | 'secondary' | 'gold' | 'danger';
  icon?: IconName;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', icon, disabled, style }: ButtonProps) {
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
    container: { backgroundColor: colors.primary },
    label: { color: colors.white },
  },
  dark: {
    container: { backgroundColor: colors.textDark },
    label: { color: colors.cream },
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
    borderRadius: 14,
    paddingVertical: spacing.md,
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
