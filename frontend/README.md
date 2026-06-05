# CNH Connect — App (Expo / React Native)

Aplicativo mobile do CNH Connect. Fala **somente** com a API FastAPI (`backend/`), nunca com o
Supabase direto. Roda em modo **web** para teste rápido, além de Expo Go (celular) / emulador.

## Pré-requisitos
- Node 20+ e npm.
- A API do backend rodando em `http://localhost:8000` (use `docker compose up` na raiz).

## ⚠️ Certificado SSL (Windows com antivírus/proxy)
Em máquinas com inspeção de HTTPS (o mesmo motivo de rodarmos o backend no Docker), o `npm`/`expo`
falham com `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. Solução: usar o repositório de certificados do Windows
(que já contém a raiz do antivírus) via flag do Node 24:

```powershell
$env:NODE_OPTIONS = "--use-system-ca"     # defina antes de rodar npm/expo nesta sessão
```

Para tornar permanente, adicione `NODE_OPTIONS=--use-system-ca` às variáveis de ambiente do usuário.

## Instalar e rodar
```powershell
cd frontend
$env:NODE_OPTIONS = "--use-system-ca"
npm install
npx expo start --web                       # abre em http://localhost:8081
```
> Para celular físico via Expo Go, troque a base da API em `src/config.ts` por
> `http://SEU_IP_LOCAL:8000/api/v1` (o `localhost` do celular não enxerga o seu PC).

## Estrutura
```
src/
├── api/          cliente axios (+ JWT), tipos e funções de endpoint
├── auth/         AuthContext (login/registro/logout, token em AsyncStorage)
├── components/   UI reutilizável (botões, cards, campos, estrelas, badges)
├── navigation/   navegadores por persona (Aluno / Instrutor) + raiz
├── screens/      telas (auth, student, instructor, shared, admin)
├── utils/        formatação (datas, moeda)
├── config.ts     base da API
└── theme.ts      identidade visual (azul)
```

## Usuários de demonstração (seed)
- Aluno: `vicente@aluno.com` · Instrutor: `joao@instrutor.com` — senha `senha123`.

## Validação local (sem navegador)
```powershell
npx tsc --noEmit                # checagem de tipos
npx expo export --platform web  # valida o bundle de produção
```
