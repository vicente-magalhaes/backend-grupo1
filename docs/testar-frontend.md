# Como testar e visualizar o frontend (CNH Connect)

Guia rápido para qualquer pessoa do grupo **rodar e clicar** pelo app, sem precisar entender o código.

> **Resumo:** a forma mais fácil é abrir o app no **navegador** em modo celular. O Expo Go no iPhone
> está como **opcional/avançado** porque o app do SDK 56 ainda não saiu na App Store (ver o fim do guia).

## Pré-requisitos
- **Node.js 20+** instalado.
- O **backend no ar** (em outro terminal, na raiz do projeto): `docker compose up -d`.
  - Confirme: abrir `http://localhost:8000/api/v1/health` deve responder `{"status":"ok",...}`.
- Usuários de demonstração (senha **`senha123`**):
  - Aluno: **`vicente@aluno.com`**
  - Instrutor: **`joao@instrutor.com`**

---

## ✅ Caminho 1 (recomendado): navegador em modo celular

```powershell
cd frontend
npm install                              # só na primeira vez
$env:NODE_OPTIONS="--use-system-ca"      # Windows com antivírus que inspeciona HTTPS
npx expo start --web
```
Abre em **`http://localhost:8081`**. Para ver com cara de celular:
1. **F12** (DevTools) → ícone de **celular/tablet** (ou `Ctrl+Shift+M`).
2. Escolha um preset **iPhone** no topo.

Tem **hot-reload**: salvar o código atualiza a tela na hora. É o ideal para acompanhar o visual.

## ✅ Caminho 2: tudo via Docker (sem Node)

Na raiz do projeto:
```powershell
docker compose up --build
```
Abre o app em **`http://localhost:3000`** (servido por nginx) e a API em `:8000`, integrados. Não tem
hot-reload (é o build de produção), mas é a forma de mostrar "sobe tudo com um comando".

---

## 🧭 O que clicar (roteiro de demonstração)

**Como aluno** (`vicente@aluno.com`):
1. **Buscar** → ajuste os filtros (categoria, região, modalidade) → *Buscar instrutores*.
2. Toque num instrutor → veja o perfil e os **horários** → *Solicitar* → **Pagamento** → confirmar.
3. **Agendamentos** → abra o **Chat**, mande mensagem, avalie com estrelas.
4. **Evolução** (dashboard) e **Perfil** (editar dados / virar instrutor).

**Como instrutor** (`joao@instrutor.com`):
1. **Solicitações** → *Aceitar* ou *Recusar* uma aula.
2. **Agenda** (cronológica) · **Relatórios** → *Avaliar aula* (notas com +/-).
3. **Evolução dos alunos** e **Perfil** (preço/região/método).

---

## 🆘 Problemas comuns
- **Tela branca / erro estranho ao iniciar:** limpe o cache → `npx expo start --web -c`.
- **App abre mas nada carrega (login falha):** o backend não está no ar → rode `docker compose up -d`
  e teste `http://localhost:8000/api/v1/health`.
- **"Token inválido ou expirado" ao pagar / enviar mensagem (mas a busca funciona):** seu token JWT
  expirou (ou o backend reiniciou com outro `JWT_SECRET`). Não tem a ver com a senha — o token é
  independente dela. **Solução: saia e logue de novo** para emitir um token novo. O app já derruba a
  sessão sozinho no 401 e volta ao Login; se você reiniciou o backend, faça `docker compose up --build`
  para aplicar a validade do token (8h).
- **Instrutores com "Sem horários disponíveis":** os horários do seed "vencem" pela regra dos 8 dias
  (REQ03). Rode `backend/db/0005_seed_extra.sql` no SQL Editor do Supabase para repovoar com datas
  frescas (é idempotente — pode rodar antes de cada demo).
- **`npm install` falha com erro de SSL/certificado (Windows):** rode antes
  `$env:NODE_OPTIONS="--use-system-ca"` (usa os certificados do Windows).

---

## 📱 OPCIONAL -- NÃO TESTAR AGORA LEE E GABRIEL /avançado: testar no iPhone real (Expo Go via TestFlight)

O app está no **Expo SDK 56**, cujo Expo Go **ainda não está na App Store** (atraso de aprovação da
Apple). Para testar no aparelho:
1. Instale o **TestFlight** no iPhone e entre no beta do Expo Go:
   **https://testflight.apple.com/join/GZJxxfUU** (ou `https://expo.dev/go?sdkVersion=56&platform=ios&device=true`).
2. Celular e PC na **mesma Wi-Fi** (redes de campus tipo *eduroam* costumam **isolar** dispositivos — use
   uma rede doméstica ou roteador/hotspot).
3. Suba o servidor forçando o IP da sua máquina (troque pelo seu IP da Wi-Fi):
   ```powershell
   cd frontend
   $env:NODE_OPTIONS="--use-system-ca"
   $env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.x.x"
   npx expo start
   ```
4. Escaneie o QR com a câmera. Se o app não baixar, o **Firewall do Windows** pode bloquear a porta 8081
   (PowerShell como Administrador):
   ```powershell
   New-NetFirewallRule -DisplayName "CNH Expo Metro 8081" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8081 -Profile Private
   ```
   > O `config.ts` detecta o IP automaticamente, então o app no celular já aponta para a API do PC
   > (`http://SEU_IP:8000`). Teste rápido: abra `http://SEU_IP:8000/api/v1/health` no Safari do iPhone.
