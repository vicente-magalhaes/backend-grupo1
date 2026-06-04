import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { theme } from '../theme';
import { RequestsScreen } from '../screens/instructor/RequestsScreen';
import { AgendaScreen } from '../screens/instructor/AgendaScreen';
import { ReportsScreen } from '../screens/instructor/ReportsScreen';
import { InstructorDashboardScreen } from '../screens/instructor/InstructorDashboardScreen';
import { InstructorProfileScreen } from '../screens/instructor/InstructorProfileScreen';
import { CreateReportScreen } from '../screens/instructor/CreateReportScreen';
import { ChatScreen } from '../screens/shared/ChatScreen';
import type { InstructorStackParamList } from './types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<InstructorStackParamList>();

const icon = (emoji: string) => () => <Text style={{ fontSize: 18 }}>{emoji}</Text>;

const headerStyle = {
  headerStyle: { backgroundColor: theme.colors.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' as const },
};

function InstructorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...headerStyle,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
      }}
    >
      <Tab.Screen
        name="Solicitações"
        component={RequestsScreen}
        options={{ tabBarIcon: icon('📨'), title: 'Solicitações' }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{ tabBarIcon: icon('🗓️'), title: 'Minha agenda' }}
      />
      <Tab.Screen
        name="Relatórios"
        component={ReportsScreen}
        options={{ tabBarIcon: icon('📝'), title: 'Relatórios de aula' }}
      />
      <Tab.Screen
        name="Evolução"
        component={InstructorDashboardScreen}
        options={{ tabBarIcon: icon('📈'), title: 'Evolução dos alunos' }}
      />
      <Tab.Screen
        name="Perfil"
        component={InstructorProfileScreen}
        options={{ tabBarIcon: icon('👤'), title: 'Meu perfil' }}
      />
    </Tab.Navigator>
  );
}

export function InstructorNavigator() {
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="Tabs" component={InstructorTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen
        name="CreateReport"
        component={CreateReportScreen}
        options={{ title: 'Novo relatório' }}
      />
      <Stack.Screen
        name="StudentDashboard"
        component={InstructorDashboardScreen}
        options={{ title: 'Evolução do aluno' }}
      />
    </Stack.Navigator>
  );
}
