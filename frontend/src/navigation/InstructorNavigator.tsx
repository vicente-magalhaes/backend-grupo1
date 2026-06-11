import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AgendaScreen } from '../screens/instructor/AgendaScreen';
import { CreateReportScreen } from '../screens/instructor/CreateReportScreen';
import { InstructorDashboardScreen } from '../screens/instructor/InstructorDashboardScreen';
import { InstructorProfileScreen } from '../screens/instructor/InstructorProfileScreen';
import { ReportsScreen } from '../screens/instructor/ReportsScreen';
import { RequestsScreen } from '../screens/instructor/RequestsScreen';
import { ChatScreen } from '../screens/shared/ChatScreen';
import { headerOptions, tabBarScreenOptions, tabIcon } from './navTheme';
import type { InstructorStackParamList } from './types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<InstructorStackParamList>();

function InstructorTabs() {
  return (
    <Tab.Navigator screenOptions={tabBarScreenOptions}>
      <Tab.Screen
        name="Solicitações"
        component={RequestsScreen}
        options={{ tabBarIcon: tabIcon('mail', 'mail-outline'), title: 'Solicitações' }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{ tabBarIcon: tabIcon('calendar', 'calendar-outline'), title: 'Minha agenda' }}
      />
      <Tab.Screen
        name="Relatórios"
        component={ReportsScreen}
        options={{ tabBarIcon: tabIcon('document-text', 'document-text-outline'), title: 'Relatórios de aula' }}
      />
      <Tab.Screen
        name="Evolução"
        component={InstructorDashboardScreen}
        options={{ tabBarIcon: tabIcon('stats-chart', 'stats-chart-outline'), title: 'Evolução dos alunos' }}
      />
      <Tab.Screen
        name="Perfil"
        component={InstructorProfileScreen}
        options={{ tabBarIcon: tabIcon('person', 'person-outline'), title: 'Meu perfil' }}
      />
    </Tab.Navigator>
  );
}

export function InstructorNavigator() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="Tabs" component={InstructorTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="CreateReport" component={CreateReportScreen} options={{ title: 'Novo relatório' }} />
      <Stack.Screen
        name="StudentDashboard"
        component={InstructorDashboardScreen}
        options={{ title: 'Evolução do aluno' }}
      />
    </Stack.Navigator>
  );
}
