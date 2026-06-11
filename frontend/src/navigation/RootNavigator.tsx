import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../auth/AuthContext';
import { Loading } from '../components';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { AdminScreen } from '../screens/admin/AdminScreen';
import { InstructorNavigator } from './InstructorNavigator';
import { navTheme } from './navTheme';
import { StudentNavigator } from './StudentNavigator';
import type { AuthStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();

  return (
    <NavigationContainer theme={navTheme}>
      {loading ? (
        <Loading label="Carregando..." />
      ) : !user ? (
        <AuthFlow />
      ) : user.role === 'instructor' ? (
        <InstructorNavigator />
      ) : user.role === 'admin' ? (
        <AdminScreen />
      ) : (
        <StudentNavigator />
      )}
    </NavigationContainer>
  );
}
