import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { API_BASE_URL } from '../config';

export const TOKEN_KEY = 'cnh_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Anexa o JWT (se houver) em toda requisição.
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Extrai a mensagem de erro de domínio retornada pelo backend ({"detail": ...}). */
export function apiErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { detail?: string } }; message?: string };
  return err?.response?.data?.detail || err?.message || 'Erro inesperado';
}
