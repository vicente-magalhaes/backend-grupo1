# ==========================================
# CNH Connect — Frontend (Expo Web → estático servido por nginx)
# ==========================================
# Build de produção do app (sem hot-reload). Para desenvolver telas com
# recarregamento automático, use `npx expo start --web` no host.

# ── Estágio 1: gera o bundle web estático com o Expo ──────────────
FROM node:22-alpine AS build
WORKDIR /app

# Dependências primeiro (camada cacheável)
COPY package.json package-lock.json ./
RUN npm ci

# Código da aplicação
COPY . .

# URL same-origin: no navegador o app chama /api/v1 e o nginx repassa ao
# contêiner `backend` pela rede interna do Compose (http://backend:8000).
ENV EXPO_PUBLIC_API_URL=/api/v1
RUN npx expo export --platform web --output-dir dist

# ── Estágio 2: serve o estático e faz proxy reverso da API ────────
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
