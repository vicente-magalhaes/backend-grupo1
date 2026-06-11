import { Pressable, View, type ViewStyle } from 'react-native';

import { theme } from '../theme';
import { Txt } from './typography';

/** Pílula selecionável (filtro). */
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          paddingHorizontal: theme.space.md,
          paddingVertical: theme.space.sm,
          borderRadius: theme.radii.pill,
          backgroundColor: selected ? theme.colors.accent : theme.colors.surface,
          borderWidth: 1,
          borderColor: selected ? theme.colors.accent : theme.colors.separator,
        },
        theme.shadows.sm,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Txt variant="subhead" color={selected ? '#fff' : theme.colors.text}>
        {label}
      </Txt>
    </Pressable>
  );
}

/** Linha de chips multi-seleção. */
export function Chips({
  options,
  value,
  onChange,
  style,
}: {
  options: { label: string; value: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  style?: ViewStyle;
}) {
  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }
  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }, style]}>
      {options.map((o) => (
        <Chip key={o.value} label={o.label} selected={value.includes(o.value)} onPress={() => toggle(o.value)} />
      ))}
    </View>
  );
}

/** Controle segmentado estilo iOS (escolha única entre poucas opções). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: theme.colors.surfaceSecondary,
          borderRadius: theme.radii.input,
          padding: 3,
        },
        style,
      ]}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            style={[
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                borderRadius: theme.radii.input - 3,
              },
              active && { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
            ]}
          >
            <Txt variant="subhead" color={active ? theme.colors.text : theme.colors.textSecondary}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
