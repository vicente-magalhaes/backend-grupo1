import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';

import { theme } from '../theme';
import { Icon, type IconName } from './Icon';
import { Txt } from './typography';

/** Campo de texto Apple-clean: preenchido, anel de foco accent, ícone e erro. */
export function TextField({
  label,
  error,
  icon,
  secureToggle,
  containerStyle,
  style,
  ...props
}: {
  label?: string;
  error?: string;
  icon?: IconName;
  secureToggle?: boolean;
  containerStyle?: ViewStyle;
} & TextInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState<boolean>(secureToggle ? true : !!props.secureTextEntry);

  const borderColor = error ? theme.colors.danger : focused ? theme.colors.accent : 'transparent';
  const bg = focused ? theme.colors.surface : theme.colors.surfaceSecondary;

  return (
    <View style={[{ gap: theme.space.xs }, containerStyle]}>
      {label ? (
        <Txt variant="footnote" color={theme.colors.textSecondary}>
          {label}
        </Txt>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space.sm,
          backgroundColor: bg,
          borderRadius: theme.radii.input,
          borderWidth: 1.5,
          borderColor,
          paddingHorizontal: theme.space.md,
          minHeight: 48,
        }}
      >
        {icon ? <Icon name={icon} size={18} color={theme.colors.textTertiary} /> : null}
        <TextInput
          {...props}
          secureTextEntry={secureToggle ? hidden : props.secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={theme.colors.textTertiary}
          style={[
            {
              flex: 1,
              color: theme.colors.text,
              fontFamily: theme.fonts.regular,
              fontSize: 16,
              paddingVertical: 12,
            },
            style,
          ]}
        />
        {secureToggle ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Icon
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={theme.colors.textTertiary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Txt variant="caption" color={theme.colors.danger}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

/** Compat: antigo Field (label obrigatório). */
export function Field({ label, ...props }: { label: string } & TextInputProps) {
  return <TextField label={label} {...props} />;
}
