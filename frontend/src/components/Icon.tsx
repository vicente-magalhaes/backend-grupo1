import { Ionicons } from '@expo/vector-icons';

import { theme } from '../theme';

export type IconName = keyof typeof Ionicons.glyphMap;

/** Ponto único de ícones do app (Ionicons, formas próximas ao SF Symbols). */
export function Icon({
  name,
  size = 22,
  color = theme.colors.text,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
