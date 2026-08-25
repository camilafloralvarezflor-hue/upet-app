import { Text, TextProps } from 'react-native';

import { typography } from '../theme/tokens';

type Variant = keyof typeof typography;

interface TypographyProps extends TextProps {
  variant?: Variant;
}

export function AppText({ variant = 'body', style, ...props }: TypographyProps) {
  return <Text style={[typography[variant], style]} {...props} />;
}

export function Heading1(props: TextProps) {
  return <AppText variant="h1" {...props} />;
}

export function Heading2(props: TextProps) {
  return <AppText variant="h2" {...props} />;
}

export function Heading3(props: TextProps) {
  return <AppText variant="h3" {...props} />;
}

export function BodyText(props: TextProps) {
  return <AppText variant="body" {...props} />;
}

export function MutedText(props: TextProps) {
  return <AppText variant="bodyMuted" {...props} />;
}

export function Caption(props: TextProps) {
  return <AppText variant="caption" {...props} />;
}
