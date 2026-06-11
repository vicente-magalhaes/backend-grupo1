import { Pressable, View } from 'react-native';

import { theme } from '../theme';
import { Icon } from './Icon';
import { Txt } from './typography';

/** Avaliação em estrelas (display). */
export function Stars({
  value,
  size = 16,
  showValue = true,
}: {
  value?: number | null;
  size?: number;
  showValue?: boolean;
}) {
  if (value === null || value === undefined) {
    return (
      <Txt variant="footnote" color={theme.colors.textSecondary}>
        Sem avaliações
      </Txt>
    );
  }
  const full = Math.round(value);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{ flexDirection: 'row' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon key={i} name={i <= full ? 'star' : 'star-outline'} size={size} color={theme.colors.star} />
        ))}
      </View>
      {showValue ? (
        <Txt variant="footnote" color={theme.colors.textSecondary}>
          {value.toFixed(1)}
        </Txt>
      ) : null}
    </View>
  );
}

/** Avaliação interativa (escolher nota). */
export function StarPicker({
  value,
  onChange,
  size = 32,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable key={i} onPress={() => onChange(i)} hitSlop={6} accessibilityRole="button">
          <Icon name={i <= value ? 'star' : 'star-outline'} size={size} color={theme.colors.star} />
        </Pressable>
      ))}
    </View>
  );
}
