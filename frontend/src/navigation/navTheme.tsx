import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { Icon, type IconName } from '../components/Icon';
import { theme } from '../theme';

/** Tema do NavigationContainer (Apple-clean: fundo claro, acento azul). */
export const navTheme: NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.accent,
    background: theme.colors.bg,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.separator,
    notification: theme.colors.danger,
  },
};

const headerBase = {
  headerStyle: { backgroundColor: theme.colors.surface },
  headerTitleStyle: { color: theme.colors.text, fontFamily: theme.fonts.semibold, fontSize: 17 },
  headerShadowVisible: false,
};

/** Header de telas de stack (back accent). */
export const headerOptions: NativeStackNavigationOptions = {
  ...headerBase,
  headerTintColor: theme.colors.accent,
  contentStyle: { backgroundColor: theme.colors.bg },
};

/** Opções de tabs + header das telas de aba. */
export const tabBarScreenOptions: BottomTabNavigationOptions = {
  ...headerBase,
  headerTintColor: theme.colors.text,
  tabBarActiveTintColor: theme.colors.accent,
  tabBarInactiveTintColor: theme.colors.textTertiary,
  tabBarStyle: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.separator,
    borderTopWidth: 1,
  },
  tabBarLabelStyle: { fontFamily: theme.fonts.medium, fontSize: 11 },
};

/** Ícone de aba: outline quando inativo, filled quando ativo (cara SF Symbols). */
export function tabIcon(active: IconName, inactive: IconName) {
  function TabBarIcon({ focused, color, size }: { focused: boolean; color: string; size: number }) {
    return <Icon name={focused ? active : inactive} size={size} color={color} />;
  }
  return TabBarIcon;
}
