import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { setUnauthorizedHandler, TOKEN_KEY } from '../api/client';
import { authApi, type LoginPayload, type RegisterPayload, usersApi } from '../api/endpoints';
import type { UserOut } from '../api/types';

interface AuthState {
  user: UserOut | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    try {
      const me = await usersApi.me();
      setUser(me);
    } catch {
      setUser(null);
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }

  useEffect(() => {
    // Em qualquer 401 (token expirado/inválido), derruba a sessão → volta ao Login.
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        await loadMe();
      }
      setLoading(false);
    })();
  }, []);

  async function login(payload: LoginPayload) {
    const res = await authApi.login(payload);
    await AsyncStorage.setItem(TOKEN_KEY, res.access_token);
    await loadMe();
  }

  async function register(payload: RegisterPayload) {
    const res = await authApi.register(payload);
    await AsyncStorage.setItem(TOKEN_KEY, res.access_token);
    await loadMe();
  }

  async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  const value = useMemo<AuthState>(
    () => ({ user, loading, login, register, logout, refresh: loadMe }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}
