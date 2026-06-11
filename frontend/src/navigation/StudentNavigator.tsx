import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BookingsScreen } from '../screens/student/BookingsScreen';
import { InstructorDetailScreen } from '../screens/student/InstructorDetailScreen';
import { InstructorRequestScreen } from '../screens/student/InstructorRequestScreen';
import { PaymentScreen } from '../screens/student/PaymentScreen';
import { SearchScreen } from '../screens/student/SearchScreen';
import { StudentDashboardScreen } from '../screens/student/StudentDashboardScreen';
import { StudentProfileScreen } from '../screens/student/StudentProfileScreen';
import { ChatScreen } from '../screens/shared/ChatScreen';
import { headerOptions, tabBarScreenOptions, tabIcon } from './navTheme';
import type { StudentStackParamList } from './types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<StudentStackParamList>();

function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={tabBarScreenOptions}>
      <Tab.Screen
        name="Buscar"
        component={SearchScreen}
        options={{ tabBarIcon: tabIcon('search', 'search-outline'), title: 'Buscar instrutores' }}
      />
      <Tab.Screen
        name="Agendamentos"
        component={BookingsScreen}
        options={{ tabBarIcon: tabIcon('calendar', 'calendar-outline'), title: 'Meus agendamentos' }}
      />
      <Tab.Screen
        name="Evolução"
        component={StudentDashboardScreen}
        options={{ tabBarIcon: tabIcon('stats-chart', 'stats-chart-outline'), title: 'Dashboard de evolução' }}
      />
      <Tab.Screen
        name="Perfil"
        component={StudentProfileScreen}
        options={{ tabBarIcon: tabIcon('person', 'person-outline'), title: 'Meu perfil' }}
      />
    </Tab.Navigator>
  );
}

export function StudentNavigator() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="Tabs" component={StudentTabs} options={{ headerShown: false }} />
      <Stack.Screen name="InstructorDetail" component={InstructorDetailScreen} options={{ title: 'Instrutor' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Pagamento' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen
        name="InstructorRequest"
        component={InstructorRequestScreen}
        options={{ title: 'Seja um instrutor' }}
      />
    </Stack.Navigator>
  );
}
