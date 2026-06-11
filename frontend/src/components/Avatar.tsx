import { Image, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { theme } from '../theme';
import { Icon, type IconName } from './Icon';
import { Txt } from './typography';

/** Avatar circular: imagem, iniciais ou ícone (substitui as caixas "FOTO"). */
export function Avatar({
  name,
  uri,
  icon,
  size = 48,
  style,
}: {
  name?: string;
  uri?: string | null;
  icon?: IconName;
  size?: number;
  style?: ViewStyle;
}) {
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
    : null;

  const base: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  if (uri) {
    return <Image source={{ uri }} style={[base, style] as unknown as StyleProp<ImageStyle>} />;
  }
  return (
    <View style={[base, style]}>
      {initials ? (
        <Txt variant="headline" color={theme.colors.accent}>
          {initials}
        </Txt>
      ) : (
        <Icon name={icon ?? 'person'} size={size * 0.5} color={theme.colors.accent} />
      )}
    </View>
  );
}
