import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { theme } from '../theme';
import { SearchScreen } from '../screens/student/SearchScreen';
import { InstructorDetailScreen } from '../screens/student/InstructorDetailScreen';
import { PaymentScreen } from '../screens/student/PaymentScreen';
import { BookingsScreen } from '../screens/student/BookingsScreen';
import { StudentDashboardScreen } from '../screens/student/StudentDashboardScreen';
import { StudentProfileScreen } from '../screens/student/StudentProfileScreen';
import { InstructorRequestScreen } from '../screens/student/InstructorRequestScreen';
import { ChatScreen } from '../screens/shared/ChatScreen';
import type { StudentStackParamList } from './types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<StudentStackParamList>();

const icon = (emoji: string) => () => <Text style={{ fontSize: 18 }}>{emoji}</Text>;

const headerStyle = {
  headerStyle: { backgroundColor: theme.colors.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' as const },
};

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...headerStyle,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
      }}
    >
      <Tab.Screen
        name="Buscar"
        component={SearchScreen}
        options={{ tabBarIcon: icon('🔍'), title: 'Buscar instrutores' }}
      />
      <Tab.Screen
        name="Agendamentos"
        component={BookingsScreen}
        options={{ tabBarIcon: icon('📅'), title: 'Meus agendamentos' }}
      />
      <Tab.Screen
        name="Evolução"
        component={StudentDashboardScreen}
        options={{ tabBarIcon: icon('📈'), title: 'Dashboard de evolução' }}
      />
      <Tab.Screen
        name="Perfil"
        component={StudentProfileScreen}
        options={{ tabBarIcon: icon('👤'), title: 'Meu perfil' }}
      />
    </Tab.Navigator>
  );
}

export function StudentNavigator() {
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="Tabs" component={StudentTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="InstructorDetail"
        component={InstructorDetailScreen}
        options={{ title: 'Instrutor' }}
      />
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
