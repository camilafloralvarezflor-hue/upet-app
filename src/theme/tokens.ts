// Paleta y tipografía del rebrand "Mawys UI": verde oliva/salvia + terracota
// (semántica, solo para urgencia/vencimiento/SOS), Caprasimo para títulos y
// montos/timer, Figtree para todo el texto corrido.

export const colors = {
  // brand — verde oliva
  brand900: '#272E1B',
  brand700: '#56633F',
  brand500: '#8FA073',
  brand200: '#E1EECC',
  brandDark: '#3D472B',
  brandLightBg: '#F0FAE1',
  brandCircleSoft: '#CCDBB2',
  brandCircleFaint: '#AEBF92',
  routeWalked: '#728157',

  // alert — terracota, solo urgencia/SOS/vencimiento/falta-algo
  alert500: '#C67139',
  alert200: '#FFE1D0',
  alertText: '#8C491A',

  // base
  bgApp: '#F9F4ED',
  bgCard: '#FFFFFF',
  bgNeutral: '#EEE7DB',
  border300: '#DCD3C4',
  textDark: '#201E1D',
  textMuted: 'rgba(32,30,29,0.62)',
  textFaint: 'rgba(32,30,29,0.5)',
  textFainter: 'rgba(32,30,29,0.4)',
  iconFaint: '#A19786',
  onDark: '#F5EAD8',
  onDarkMuted: 'rgba(245,234,216,0.6)',
  white: '#FFFFFF',

  // alias retrocompatibles usados por componentes compartidos
  primary: '#272E1B',
  cream: '#F9F4ED',
  primaryLight: '#E1EECC',
  gold: '#C67139',
  border: '#DCD3C4',
  danger: '#C67139',
  dangerText: '#8C491A',
  dangerBg: '#FFE1D0',
  amber: '#8C491A',
  amberBg: '#FFE1D0',
} as const;

export const fonts = {
  display: 'Caprasimo_400Regular',
  heading: 'Caprasimo_400Regular',
  headingBold: 'Caprasimo_400Regular',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodySemiBold: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
  mono: 'ui-monospace',
} as const;

export const typography = {
  display: { fontFamily: fonts.display, fontSize: 36, lineHeight: 39, color: colors.textDark },
  h1: { fontFamily: fonts.display, fontSize: 23, lineHeight: 27, color: colors.textDark },
  h2: { fontFamily: fonts.display, fontSize: 19, lineHeight: 23, color: colors.textDark },
  h3: { fontFamily: fonts.display, fontSize: 16, lineHeight: 20, color: colors.textDark },
  logo: { fontFamily: fonts.display, fontSize: 21, lineHeight: 25, color: colors.textDark },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textDark },
  bodyMedium: { fontFamily: fonts.bodySemiBold, fontSize: 14.5, lineHeight: 20, color: colors.textDark },
  bodyMuted: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, color: colors.textFaint },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    lineHeight: 15,
    letterSpacing: 0.6,
    color: colors.textFaint,
    textTransform: 'uppercase' as const,
  },
  code: { fontFamily: fonts.mono, fontSize: 11, lineHeight: 14, color: colors.brand700 },
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
  md: 14,
  lg: 24,
  xl: 28,
  pill: 999,
} as const;

export const theme = { colors, fonts, typography, spacing, radii } as const;

export type Theme = typeof theme;
