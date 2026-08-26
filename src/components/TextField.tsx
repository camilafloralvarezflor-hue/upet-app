import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { MutedText } from './Typography';
import { colors, fonts, spacing } from '../theme/tokens';

interface TextFieldProps extends TextInputProps {
  label: string;
  icon?: IconName;
}

export function TextField({ label, icon, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <MutedText style={styles.label}>{label}</MutedText>
      <View style={styles.inputRow}>
        {icon && (
          <View style={styles.inputIcon}>
            <Icon name={icon} size={17} color={colors.textFaint} strokeWidth={2} />
          </View>
        )}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, style]}
          placeholderTextColor={colors.textFaint}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
  },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textDark,
    backgroundColor: colors.white,
  },
  inputWithIcon: {
    paddingLeft: 40,
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
});
