import type { ReactNode } from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { theme, typography, type TypographyRole } from '../theme';

export function Txt({
  variant = 'body',
  color = theme.colors.text,
  style,
  children,
  ...props
}: {
  variant?: TypographyRole;
  color?: string;
  children?: ReactNode;
} & TextProps) {
  return (
    <RNText style={[typography[variant], { color }, style as TextStyle]} {...props}>
      {children}
    </RNText>
  );
}

/** Título de seção (compat com telas antigas). */
export function H1({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return (
    <Txt variant="title2" style={style}>
      {children}
    </Txt>
  );
}

/** Texto secundário (compat). */
export function Muted({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return (
    <Txt variant="footnote" color={theme.colors.textSecondary} style={style}>
      {children}
    </Txt>
  );
}
