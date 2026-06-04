/** Tema visual do CNH Connect — identidade azul. */
export const theme = {
  colors: {
    primary: '#1565C0',
    primaryDark: '#0D47A1',
    primaryLight: '#E3F2FD',
    bg: '#F4F7FB',
    card: '#FFFFFF',
    text: '#1A2027',
    muted: '#6B7785',
    border: '#E2E8F0',
    danger: '#C62828',
    success: '#2E7D32',
    warning: '#F5A623',
    star: '#F5A623',
  },
  radius: 12,
  spacing: (n: number) => n * 8,
};

export type Theme = typeof theme;
