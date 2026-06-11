import type { ReactNode } from 'react';
import { ActivityIndicator, View, type DimensionValue, type ViewStyle } from 'react-native';

import { theme } from '../theme';
import { Icon, type IconName } from './Icon';
import { Txt } from './typography';

export function Loading({ label }: { label?: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: theme.space.xxl, gap: theme.space.sm }}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
      {label ? (
        <Txt variant="footnote" color={theme.colors.textSecondary}>
          {label}
        </Txt>
      ) : null}
    </View>
  );
}

export function EmptyState({
  text,
  icon,
  action,
}: {
  text: string;
  icon?: IconName;
  action?: ReactNode;
}) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: theme.space.xxl, gap: theme.space.md }}>
      {icon ? <Icon name={icon} size={40} color={theme.colors.textTertiary} /> : null}
      <Txt variant="subhead" color={theme.colors.textSecondary} style={{ textAlign: 'center' }}>
        {text}
      </Txt>
      {action}
    </View>
  );
}

export function Skeleton({
  height = 16,
  width = '100%',
  radius = theme.radii.input,
  style,
}: {
  height?: number;
  width?: DimensionValue;
  radius?: number;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        { height, width, borderRadius: radius, backgroundColor: theme.colors.surfaceSecondary },
        style,
      ]}
    />
  );
}

/** Banner de feedback inline (substitui textos de erro vermelhos soltos). */
export function Toast({
  message,
  tone = 'danger',
}: {
  message: string;
  tone?: 'danger' | 'success' | 'warning' | 'info';
}) {
  const map: Record<string, { bg: string; fg: string; icon: IconName }> = {
    danger: { bg: theme.colors.dangerSoft, fg: theme.colors.danger, icon: 'alert-circle' },
    success: { bg: theme.colors.successSoft, fg: theme.colors.success, icon: 'checkmark-circle' },
    warning: { bg: theme.colors.warningSoft, fg: theme.colors.warning, icon: 'warning' },
    info: { bg: theme.colors.accentSoft, fg: theme.colors.accent, icon: 'information-circle' },
  };
  const s = map[tone];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.sm,
        backgroundColor: s.bg,
        borderRadius: theme.radii.input,
        padding: theme.space.md,
      }}
    >
      <Icon name={s.icon} size={18} color={s.fg} />
      <Txt variant="subhead" color={s.fg} style={{ flex: 1 }}>
        {message}
      </Txt>
    </View>
  );
}
