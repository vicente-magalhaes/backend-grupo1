import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Base da API FastAPI. Resolução, em ordem de prioridade:
 *  1) EXPO_PUBLIC_API_URL — override explícito. O build web no Docker usa `/api/v1`
 *     (same-origin; o nginx faz proxy para o contêiner backend).
 *  2) Expo Go em celular físico (iPhone/Android): IP da máquina de desenvolvimento que o
 *     Expo já conhece (`hostUri`). É isso que faz o celular alcançar o backend na mesma Wi-Fi —
 *     `localhost`, no celular, seria o próprio aparelho.
 *  3) Emulador Android → 10.0.2.2 (alias do host).
 *  4) Fallback (web dev / simulador iOS) → localhost.
 * Escape hatch para VPN / Wi-Fi com isolamento de cliente / múltiplas placas: setar EXPO_PUBLIC_API_URL.
 */
const PORT = 8000;
const SUFFIX = '/api/v1';

function devHostIp(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    // fallbacks para diferentes formatos de manifesto do Expo Go
    (Constants as unknown as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig?.debuggerHost ??
    (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } })
      .manifest2?.extra?.expoGo?.debuggerHost;
  if (!hostUri) return null;
  const host = String(hostUri).split(':')[0].trim();
  return host && host !== 'localhost' && host !== '127.0.0.1' ? host : null;
}

function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const ip = devHostIp();
  if (ip) return `http://${ip}:${PORT}${SUFFIX}`;
  if (Platform.OS === 'android') return `http://10.0.2.2:${PORT}${SUFFIX}`;
  return `http://localhost:${PORT}${SUFFIX}`;
}

export const API_BASE_URL = resolveBaseUrl();

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[CNH] API_BASE_URL =', API_BASE_URL);
}
