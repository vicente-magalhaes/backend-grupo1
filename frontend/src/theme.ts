import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Design system do CNH Connect — Apple-clean + acento azul.
 * Ver `.agent/skills/60-design-system.md` (tokens) e `61-ui-usability.md` (padrões).
 * Tokens novos são aditivos; aliases legados (primary, card, muted, border, radius, spacing)
 * mantidos para telas ainda não migradas.
 */

const palette = {
  // Superfícies
  bg: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceSecondary: '#EAEAEF',
  separator: 'rgba(60,60,67,0.16)',
  // Texto
  text: '#1C1C1E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  // Acento (marca)
  accent: '#0A63D4',
  accentPressed: '#084FA8',
  accentSoft: '#E7F0FD',
  // Semânticas
  success: '#1F9D57',
  successSoft: '#E4F6EC',
  warning: '#E8951A',
  warningSoft: '#FCEFD8',
  danger: '#E5484D',
  dangerSoft: '#FBE7E8',
  star: '#F5A623',
  // Tiles de ícone (estilo Settings)
  tileBlue: '#0A84FF',
  tileGreen: '#34C759',
  tileOrange: '#FF9F0A',
  tileRed: '#FF3B30',
  tilePurple: '#AF52DE',
  tileTeal: '#30B0C7',
};

const colors = {
  ...palette,
  // Aliases de compatibilidade
  primary: palette.accent,
  primaryDark: palette.accentPressed,
  primaryLight: palette.accentSoft,
  card: palette.surface,
  muted: palette.textSecondary,
  border: palette.separator,
};

const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const typography = {
  largeTitle: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 41, letterSpacing: -0.4 },
  title1: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  title2: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  title3: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 25 },
  headline: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 22 },
  callout: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 21 },
  subhead: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 20 },
  footnote: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export type TypographyRole = keyof typeof typography;

const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

const radii = { tile: 8, input: 12, button: 14, card: 16, sheet: 20, pill: 999 };

const shadows: Record<'none' | 'sm' | 'md', ViewStyle> = {
  none: {},
  // Card comum (sutil).
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
    android: { elevation: 2 },
    default: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  }) as ViewStyle,
  // Só para elementos que "flutuam": CTA fixo, bottom sheet, FAB.
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
    android: { elevation: 6 },
    default: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  }) as ViewStyle,
};

export const theme = {
  colors,
  fonts,
  typography,
  space,
  radii,
  shadows,
  // Aliases legados
  radius: radii.input,
  spacing: (n: number) => n * 8,
};

/** Estilo de texto por papel tipográfico + cor opcional. */
export function text(role: TypographyRole, color: string = colors.text): TextStyle {
  return { ...typography[role], color };
}

export type Theme = typeof theme;
