import type { ReactNode } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../theme';

/**
 * Wrapper de tela: fundo Apple-clean, scroll opcional e um slot `footer` para
 * a ação primária fixa no rodapé (estilo Uber "Choose UberX").
 */
export function Screen({
  children,
  scroll = true,
  footer,
  padded = true,
  style,
}: {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  padded?: boolean;
  style?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const contentStyle: ViewStyle = padded ? { padding: theme.space.lg, gap: theme.space.md } : {};

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[contentStyle, { paddingBottom: theme.space.xl }]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
  );

  return (
    <View style={[{ flex: 1, backgroundColor: theme.colors.bg }, style]}>
      {body}
      {footer ? (
        <View
          style={{
            padding: theme.space.lg,
            paddingBottom: theme.space.lg + insets.bottom,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.separator,
            ...theme.shadows.md,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}
