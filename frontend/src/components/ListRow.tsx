import type { ReactNode } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';

import { theme } from '../theme';
import { Icon, type IconName } from './Icon';
import { Txt } from './typography';

/** Linha estilo Ajustes do iOS: tile de ícone + título/subtítulo + valor + chevron. */
export function ListRow({
  title,
  subtitle,
  value,
  icon,
  tileColor,
  onPress,
  right,
  last,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: IconName;
  tileColor?: string;
  onPress?: () => void;
  right?: ReactNode;
  last?: boolean;
}) {
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.md,
        minHeight: 52,
        paddingVertical: theme.space.sm,
      }}
    >
      {icon ? (
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: theme.radii.tile,
            backgroundColor: tileColor ?? theme.colors.tileBlue,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={18} color="#fff" />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Txt variant="body">{title}</Txt>
        {subtitle ? (
          <Txt variant="footnote" color={theme.colors.textSecondary}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {value ? (
        <Txt variant="subhead" color={theme.colors.textTertiary}>
          {value}
        </Txt>
      ) : null}
      {right}
      {onPress ? <Icon name="chevron-forward" size={18} color={theme.colors.textTertiary} /> : null}
    </View>
  );

  const sep: ViewStyle = last
    ? {}
    : { borderBottomWidth: 1, borderBottomColor: theme.colors.separator };

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [sep, pressed && { opacity: 0.6 }]}>
        {content}
      </Pressable>
    );
  }
  return <View style={sep}>{content}</View>;
}
