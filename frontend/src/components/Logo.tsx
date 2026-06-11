import { View, type ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { theme } from '../theme';
import { Txt } from './typography';

/**
 * Logo CNH Connect — volante minimalista: dois arcos em "C" (um normal, um
 * espelhado), com frestas em cima e embaixo, formando o aro; três raios (um para
 * baixo, dois diagonais para cima) encontram um cubo central.
 */
export function Logo({
  size = 40,
  tint = theme.colors.accent,
  showWordmark = false,
  style,
}: {
  size?: number;
  tint?: string;
  showWordmark?: boolean;
  style?: ViewStyle;
}) {
  const mark = (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Aro: arco direito e arco esquerdo (frestas no topo e na base) */}
      <Path
        d="M61.74 13.86 A38 38 0 0 1 61.74 86.14"
        stroke={tint}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M38.26 86.14 A38 38 0 0 1 38.26 13.86"
        stroke={tint}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
      />
      {/* Raios */}
      <Line x1="50" y1="57" x2="50" y2="84" stroke={tint} strokeWidth={8} strokeLinecap="round" />
      <Line x1="45.4" y1="43.5" x2="30.8" y2="22.6" stroke={tint} strokeWidth={8} strokeLinecap="round" />
      <Line x1="54.6" y1="43.5" x2="69.2" y2="22.6" stroke={tint} strokeWidth={8} strokeLinecap="round" />
      {/* Cubo central */}
      <Circle cx="50" cy="50" r="9" fill={tint} />
    </Svg>
  );

  if (!showWordmark) return <View style={style}>{mark}</View>;

  return (
    <View style={[{ alignItems: 'center', gap: 10 }, style]}>
      {mark}
      <Txt variant="title2" color={theme.colors.text}>
        CNH Connect
      </Txt>
    </View>
  );
}

/** Compat: substitui o antigo placeholder cinza "LOGO". */
export function LogoPlaceholder({ size = 72 }: { size?: number }) {
  return <Logo size={size} showWordmark />;
}
