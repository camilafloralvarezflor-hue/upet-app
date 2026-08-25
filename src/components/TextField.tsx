import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { MutedText } from './Typography';
import { colors, fonts, radii, spacing } from '../theme/tokens';

interface TextFieldProps extends TextInputProps {
  label: string;
}

export function TextField({ label, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <MutedText style={styles.label}>{label}</MutedText>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.textFaint}
        {...props}
      />
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textDark,
    backgroundColor: colors.white,
  },
});
