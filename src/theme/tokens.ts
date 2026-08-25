export const colors = {
  primary: '#2E6F5E',
  cream: '#FBF8F4',
  textDark: '#1E2823',
  primaryLight: '#EAF3F0',
  gold: '#E8A33D',
  textMuted: '#5B6B65',
  textFaint: '#8A9A94',
  border: '#E4E0D8',
  white: '#FFFFFF',
  danger: '#C4453A',
} as const;

export const fonts = {
  heading: 'Sora_600SemiBold',
  headingBold: 'Sora_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
} as const;

export const typography = {
  h1: { fontFamily: fonts.headingBold, fontSize: 26, lineHeight: 32, color: colors.textDark },
  h2: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 28, color: colors.textDark },
  h3: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 24, color: colors.textDark },
  logo: { fontFamily: fonts.headingBold, fontSize: 20, lineHeight: 24, color: colors.textDark },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textDark },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22, color: colors.textDark },
  bodyMuted: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, color: colors.textFaint },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const theme = { colors, fonts, typography, spacing, radii } as const;

export type Theme = typeof theme;
