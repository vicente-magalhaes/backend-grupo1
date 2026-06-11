import { View } from 'react-native';

import { theme } from '../theme';

/** Barra de progresso (reuso em dashboards e no relatório de aula). */
export function ProgressBar({
  value,
  max = 1,
  height = 8,
  color = theme.colors.accent,
}: {
  value: number;
  max?: number;
  height?: number;
  color?: string;
}) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: theme.colors.surfaceSecondary,
        overflow: 'hidden',
      }}
    >
      <View
        style={{ width: `${pct * 100}%`, height: '100%', borderRadius: height / 2, backgroundColor: color }}
      />
    </View>
  );
}
