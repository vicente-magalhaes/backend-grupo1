import type { ReactNode } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';

import { theme } from '../theme';

/** Card branco Apple-clean: sombra sutil, cantos médios. Seleção com borda accent. */
export function Card({
  children,
  style,
  onPress,
  elevated = true,
  selected = false,
}: {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  selected?: boolean;
}) {
  const base: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.card,
    padding: theme.space.lg,
    gap: theme.space.sm,
    ...(elevated ? theme.shadows.sm : {}),
    ...(selected
      ? { borderWidth: 2, borderColor: theme.colors.accent, backgroundColor: theme.colors.accentSoft }
      : {}),
  };

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [base, style, pressed && { opacity: 0.85 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}
