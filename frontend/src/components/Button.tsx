import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Platform, Pressable, type ViewStyle } from 'react-native';

import { theme } from '../theme';
import { Icon, type IconName } from './Icon';
import { Txt } from './typography';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'danger-outline';
type Size = 'sm' | 'md' | 'lg';

const HEIGHTS: Record<Size, number> = { sm: 38, md: 46, lg: 52 };

const VARIANTS: Record<Variant, { fill: string; fg: string; border?: string }> = {
  primary: { fill: theme.colors.accent, fg: '#fff' },
  danger: { fill: theme.colors.danger, fg: '#fff' },
  outline: { fill: 'transparent', fg: theme.colors.accent, border: theme.colors.accent },
  'danger-outline': { fill: 'transparent', fg: theme.colors.danger, border: theme.colors.danger },
  ghost: { fill: 'transparent', fg: theme.colors.accent },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  disabled,
  loading,
  haptic = true,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  haptic?: boolean;
  style?: ViewStyle;
}) {
  const v = VARIANTS[variant];
  const isDisabled = disabled || loading;

  function handlePress() {
    if (isDisabled) return;
    if (haptic && Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          height: HEIGHTS[size],
          borderRadius: theme.radii.button,
          paddingHorizontal: theme.space.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.space.sm,
          backgroundColor: v.fill,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border,
        },
        isDisabled && { opacity: 0.45 },
        pressed && !isDisabled && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} color={v.fg} /> : null}
          <Txt variant={size === 'sm' ? 'subhead' : 'headline'} color={v.fg}>
            {title}
          </Txt>
        </>
      )}
    </Pressable>
  );
}

/** Compat: botão primário antigo. */
export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return <Button title={title} onPress={onPress} disabled={disabled} loading={loading} variant="primary" />;
}

/** Compat: botão de contorno antigo (tone primary/danger). */
export function OutlineButton({
  title,
  onPress,
  tone = 'primary',
}: {
  title: string;
  onPress: () => void;
  tone?: 'primary' | 'danger';
}) {
  return <Button title={title} onPress={onPress} variant={tone === 'danger' ? 'danger-outline' : 'outline'} />;
}
