import { Platform } from 'react-native';

/**
 * Base da API FastAPI.
 * - Web (escolha do projeto) e iOS: localhost alcança o backend rodando via Docker.
 * - Emulador Android usa 10.0.2.2 para acessar o host.
 * Para testar em celular físico, troque por http://SEU_IP_LOCAL:8000/api/v1.
 */
const HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export const API_BASE_URL = `${HOST}/api/v1`;
