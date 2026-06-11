import * as Haptics from 'expo-haptics';
import { Platform, Pressable, View } from 'react-native';

import { theme } from '../theme';
import { Icon } from './Icon';
import { ProgressBar } from './ProgressBar';
import { Txt } from './typography';

/** Controle +/- com valor e progresso (notas de 0–10 no relatório de aula). */
export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  function set(next: number) {
    const v = Math.max(min, Math.min(max, next));
    if (v !== value) {
      if (Platform.OS !== 'web') Haptics.selectionAsync();
      onChange(v);
    }
  }

  const RoundBtn = ({
    icon,
    onPress,
    disabled,
  }: {
    icon: 'remove' | 'add';
    onPress: () => void;
    disabled: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.accent,
        },
        disabled && { opacity: 0.35 },
        pressed && !disabled && { opacity: 0.85 },
      ]}
    >
      <Icon name={icon} size={20} color="#fff" />
    </Pressable>
  );

  return (
    <View style={{ gap: theme.space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt variant="subhead">{label}</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
          <RoundBtn icon="remove" onPress={() => set(value - 1)} disabled={value <= min} />
          <Txt variant="title3" color={theme.colors.accent}>
            {value}
          </Txt>
          <RoundBtn icon="add" onPress={() => set(value + 1)} disabled={value >= max} />
        </View>
      </View>
      <ProgressBar value={value} max={max} />
    </View>
  );
}
