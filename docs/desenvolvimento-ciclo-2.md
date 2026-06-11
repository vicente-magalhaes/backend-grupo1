# Guia de Desenvolvimento — Ciclo 2 (CNH Connect)

> **Para que serve este documento:** o desenvolvimento do Ciclo 2 está concluído. Este guia explica
> **tudo o que foi feito** e está organizado para alimentar diretamente as **seções 6, 7, 8 e 9** do
> `roteiro_final.pdf`. Ao fim de cada seção há uma caixa **📝 O que escrever no roteiro** com o resumo
> pronto para adaptar. Todos os dados técnicos saem do **código real** do repositório.

---

## 0. Visão geral e como rodar

**O que é:** marketplace que conecta **instrutores autônomos** a **candidatos à CNH** (Resolução
CONTRAN 1020/2025). Duas personas: **Aluno** e **Instrutor** (+ Admin).

**Stack:**
- **Backend:** Python 3.12 + FastAPI (monólito modular) — única peça que fala com o banco.
- **Banco:** Supabase (PostgreSQL gerenciado em nuvem), acesso via `supabase-py` com `service_role`.
- **Frontend:** app mobile Expo / React Native — fala **somente** com a API FastAPI.
- **Infra:** Docker + Docker Compose; CI no GitHub Actions (ruff + pytest).

**Como rodar (rotina de demonstração):**
```powershell
# Forma integrada (apresentação) — sobe backend + frontend de uma vez (NÃO precisa de venv)
docker compose up --build
#   → app em http://localhost:3000  ·  API em http://localhost:8000

# Desenvolvimento de telas (hot-reload) — Expo no host, em paralelo
cd frontend
$env:NODE_OPTIONS = "--use-system-ca"
npx expo start --web
#   → app em http://localhost:8081 (recarrega ao salvar)
```
- **Usuários de demonstração** (senha `senha123`): aluno `vicente@aluno.com` · instrutor `joao@instrutor.com`.
- **URLs úteis:** `http://localhost:3000` (app servido via Docker) · `http://localhost:8081` (app em modo dev/hot-reload) · `http://localhost:8000/docs` (Swagger — a API) · `http://localhost:8000/api/v1/health` (health check).
  > O Swagger fica em **`localhost:8000/docs`** (servido direto pelo FastAPI), não no `:3000`. E nunca use `http://backend:8000` no navegador — esse nome só resolve **entre contêineres**; do host, use `localhost`.
- O **venv** só é necessário para escrever/testar código Python localmente (`pytest`, `ruff`). Para apenas rodar, use Docker.

---

## 1. Mapa de cobertura dos requisitos

| Req | Nome | Status | Onde |
|---|---|---|---|
| REQ01 | Cadastro de usuário | ✅ Real | `auth.py`, `users.py` |
| REQ02 | Solicitação de perfil de instrutor | ✅ Real | `instructors.py` |
| REQ03 | Busca, seleção e agendamento | ✅ Real | `instructors.py`, `bookings.py` |
| REQ04 | Gestão de solicitações pelo instrutor | ✅ Real | `bookings.py` |
| REQ05 | Alocação inteligente / IA | 🟡 Heurística | `reports.py` (dashboard + sugestões) |
| REQ06 | Chat integrado | ✅ Real | `chat.py` |
| REQ07 | Compartilhamento seguro de localização | 🟡 Regra no dado | `bookings.py`/`chat.py` (sem mapa) |
| REQ08 | Relatório de aula | ✅ Real | `reports.py` |
| REQ09 | Pagamento seguro | 🟡 Simulado | `payments.py` (estados pendente→pago→reembolsado) |
| REQNF01 | Escalabilidade / nuvem | ✅ Narrativa | Supabase (Postgres em nuvem) |
| REQNF02 | Segurança e LGPD | ✅ Parcial | filtragem por ID, `audit_logs`, não-log de dados sensíveis |
| REQNF03 | Manutenibilidade | ✅ | arquitetura em camadas (skills) |
| REQNF04 | CI/CD e observabilidade | ✅ CI | GitHub Actions (ruff + pytest), `/health` |

🟡 = presente e funcional, porém simplificado/mockado conscientemente (escopo do Ciclo 2).

---

## 2. §6 — Arquitetura e implementação do Backend

### 6.1 Estrutura de pastas e separação de responsabilidades

**Organização física do repositório** — dois componentes independentes (`backend/` e `frontend/`) mais
infraestrutura e documentação na raiz:

```
dev-grupo1/
├── backend/             API FastAPI (Python) — ÚNICO componente que fala com o banco
│   ├── app/             código da aplicação (camadas, ver abaixo)
│   ├── db/              migrations SQL, seed, consultas e views (Supabase)
│   ├── tests/           testes (pytest, foco em services/)
│   └── Dockerfile       imagem da API
├── frontend/            app Expo / React Native (cliente)
│   ├── src/             código do app (ver abaixo)
│   ├── App.tsx          entrada (providers + navegação)
│   ├── Dockerfile       build web (node → nginx) + nginx.conf
│   └── app.json         config do Expo
├── docs/                requisitos e esta documentação
├── docker-compose.yml   orquestra backend + frontend
└── .github/workflows/   CI (ruff + pytest)
```

**Backend — monólito modular** com camadas de responsabilidade única (definidas em
`.agent/skills/10-fastapi-architecture.md`):

```
backend/app/
├── api/v1/        routers HTTP (só Request/Response — proibido lógica de negócio ou banco)
├── schemas/       modelos Pydantic (validação de entrada/saída)
├── services/      regras de negócio puras (não importam FastAPI)
├── repositories/  acesso EXCLUSIVO ao Supabase
├── core/          config, erros de domínio, handlers globais, segurança (JWT), dependências
└── main.py        só inicializa app, middlewares e routers
```

**Fluxo de uma requisição:** `router → service → repository → Supabase`. Erros de domínio
(`NotFoundError`, `ConflictError`, `ForbiddenError`) são lançados nos services e convertidos em HTTP
pelos handlers globais (`core/handlers.py`).

**Frontend — app Expo** organizado por responsabilidade, com as telas separadas por **persona**:

```
frontend/src/
├── api/           cliente axios + endpoints + tipos TS (espelham os schemas do backend)
├── auth/          AuthContext: login/registro e o JWT guardado no AsyncStorage
├── navigation/    React Navigation — rotas por papel (Root / Student / Instructor)
├── screens/       telas por persona: auth/ · student/ · instructor/ · shared/ · admin/
├── components/    biblioteca de UI (design system): Button, Card, TextField, Avatar,
│                  Logo (SVG), Icon, Chips, SegmentedControl, ListRow, Stepper… (barrel em index.ts)
├── utils/         formatação (datas, dinheiro)
├── config.ts      base da API (auto-detecta o IP no Expo Go; respeita EXPO_PUBLIC_API_URL)
└── theme.ts       design tokens (cores, tipografia Inter, espaçamento, raios, sombras)
```

**Design system (Ciclo 2 — repaginação visual):** o frontend foi repaginado para um visual **nativo
estilo iOS (Apple-clean) com usabilidade Uber**, guiado por dois skills:
[`60-design-system.md`](../.agent/skills/60-design-system.md) (tokens: cores, tipografia **Inter**,
espaçamento, raios, sombras sutis; logo do volante) e
[`61-ui-usability.md`](../.agent/skills/61-ui-usability.md) (padrões de tela: CTA dominante, seleção
com borda accent, list-rows, feedback). A camada visual usa **Ionicons** (ícones vetoriais, sem emoji),
**expo-font** (Inter), **react-native-svg** (logo), **reanimated**/**gesture-handler** (gestos e
animações) e **expo-haptics** (toque). As **17 telas** consomem a biblioteca de `components/`, então a
identidade é consistente e centralizada nos tokens do `theme.ts`.

**Por que backend e frontend rodam em processos separados:** o app (Expo) é **cliente**; ele **só
conversa com a API** por HTTP/JSON com token JWT. **Apenas o backend** conhece as credenciais do banco
e aplica as regras de segurança — o app nunca toca no Supabase direto. Isso isola responsabilidades,
permite trocar/escalar cada parte de forma independente (REQNF03) e mantém os segredos fora do cliente.
Mesmo quando o `docker compose up` os sobe **juntos**, continuam sendo **dois contêineres/processos
distintos** que se comunicam apenas pela rede, via HTTP — nunca por memória ou acesso direto ao banco.

### 6.2 Contrato da API (29 endpoints)

Todos sob o prefixo `/api/v1`. Documentação interativa automática em **`/docs`** (Swagger).

| Método | Rota | Descrição | REQ |
|---|---|---|---|
| POST | `/auth/register` | Cadastro de aluno (valida CPF/e-mail, unicidade) → JWT | REQ01 |
| POST | `/auth/login` | Login (bcrypt + JWT) | REQ01 |
| GET | `/users/me` | Ver meu perfil | REQ01 |
| PATCH | `/users/me` | Editar meu perfil | REQ01 |
| GET | `/users/me/notifications` | Minhas notificações | REQ04 |
| POST | `/instructors/request` | Solicitar habilitação como instrutor (docs, categorias) | REQ02 |
| GET | `/instructors/me` | Meu perfil de instrutor | REQ02 |
| PATCH | `/instructors/me` | Editar perfil de instrutor (preço, região, método) | REQ02 |
| GET | `/instructors/search` | Busca com filtros (categoria, região, veículo) e ordenação | REQ03 |
| GET | `/instructors/{instructor_id}` | Perfil público do instrutor | REQ03 |
| POST | `/instructors/{profile_id}/approve` | Aprovar instrutor (admin) | REQ02 |
| GET | `/bookings/availability/{instructor_id}` | Agenda (horários livres, regra dos 8 dias) | REQ03 |
| POST | `/bookings` | Solicitar aula (cria pagamento) | REQ03, REQ09 |
| GET | `/bookings/me/student` | Meus agendamentos (aluno) | REQ03 |
| GET | `/bookings/me/instructor` | Solicitações recebidas (instrutor) | REQ04 |
| POST | `/bookings/{booking_id}/accept` | Aceitar aula | REQ04 |
| POST | `/bookings/{booking_id}/reject` | Recusar (com motivo) | REQ04 |
| GET | `/bookings/{booking_id}/refund-policy` | Janelas e % de reembolso (calculado) | REQ03, REQ09 |
| POST | `/reports` | Criar relatório de aula (baliza/percurso/embreagem) | REQ08 |
| GET | `/reports/me` | Meus relatórios (aluno) | REQ08 |
| GET | `/reports/dashboard` | Dashboard de evolução (aluno) | REQ05 |
| GET | `/reports/dashboard/{student_id}` | Dashboard do aluno (visão do instrutor) | REQ05 |
| GET | `/reports/suggestions` | Sugestões de instrutores (IA heurística) | REQ05 |
| GET | `/chat/{booking_id}/messages` | Listar mensagens da aula | REQ06 |
| POST | `/chat/{booking_id}/messages` | Enviar mensagem (texto ou localização) | REQ06, REQ07 |
| POST | `/chat/{booking_id}/rate` | Avaliar 5★ a outra parte | REQ06 |
| GET | `/payments/{booking_id}/receipt` | Comprovante de pagamento | REQ09 |
| POST | `/payments/{booking_id}/cancel` | Cancelar e reembolsar (% por política) | REQ09 |
| GET | `/health` | Health check (observabilidade) | REQNF04 |

> Modelo de tabela exigido pela §6.2 do roteiro: Método · Rota · Descrição · (Payload/Resposta podem
> ser tirados direto do `/docs`, que mostra o schema de cada endpoint).

### 6.3 Documentação automática e integração com o frontend

- O FastAPI gera **`/docs` (Swagger)** e `/redoc` automaticamente a partir dos schemas Pydantic — esse
  é o "contrato" da API. Serve para testar endpoints na mão e como fonte do payload/resposta no roteiro.
- O app Expo consome a API por um **cliente axios** (`frontend/src/api/`) que injeta o **JWT** em toda
  requisição; os tipos TypeScript (`frontend/src/api/types.ts`) espelham os schemas do backend.
- **CORS** liberado no `main.py` para o app web acessar `localhost:8000`.
- **Resolução da URL da API** (`frontend/src/config.ts`): no build web/Docker usa `/api/v1` (proxy do
  nginx); rodando no **Expo Go**, deriva **automaticamente** o IP da máquina de desenvolvimento (o celular
  não alcança `localhost`). No Ciclo 2 o app é testado pelo **navegador** (`expo start --web` + modo
  dispositivo do Chrome), porque o Expo Go do **SDK 56 ainda não saiu na App Store** (atraso de aprovação
  da Apple); o caminho via device fica documentado para quando houver Expo Go por TestFlight.

> 📝 **O que escrever no roteiro (§6):** apresente a **organização física do código** — as pastas
> `/backend` e `/frontend` (cole as árvores da §6.1) — e **justifique por que rodam em processos
> separados** (cliente vs. servidor; só o backend fala com o banco/segredos; comunicação por HTTP+JWT).
> Descreva o monólito modular em camadas; cole a tabela de endpoints acima; mostre um print do `/docs` e
> explique que ele garantiu que o frontend consumisse os dados corretamente (contrato).

---

## 3. §7 — Infraestrutura e conteinerização (Docker)

### 7.1 Receitas de construção (Dockerfiles)
**Backend (`backend/Dockerfile`):**
- Imagem base **`python:3.12-slim`**; `WORKDIR /app`.
- Copia o `requirements.txt` e instala **antes** do código (camada cacheável → builds mais rápidos).
- Copia o código e sobe com `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
- `backend/.dockerignore` evita copiar `venv/`, caches e **`.env`** (segredos) para a imagem.

**Frontend (`frontend/Dockerfile`) — multi-stage:**
- **Estágio 1 (`node:22-alpine`):** `npm ci` + `npx expo export --platform web` geram o **bundle web
  estático** (`dist/`). A variável `EXPO_PUBLIC_API_URL=/api/v1` é injetada no build para o app chamar
  a API em *same-origin* (ver §7.2).
- **Estágio 2 (`nginx:alpine`):** copia só o `dist/` e serve com nginx. A imagem final é enxuta (não
  carrega Node nem `node_modules`). `frontend/.dockerignore` evita copiar `node_modules/` e `dist/`.

### 7.2 Orquestração (`docker-compose.yml`)
- Serviço **`backend`**: `build ./backend`, porta `8000:8000`, `env_file: ./backend/.env`.
- Serviço **`frontend`**: `build ./frontend`, porta `3000:80`, `depends_on: backend`. Serve o app Expo
  exportado (nginx) e faz **proxy reverso** de `/api/` para o backend.
- Rede interna **`cnh-net`** (bridge): é por ela que o nginx do frontend repassa as chamadas `/api` ao
  backend **pelo nome do serviço** (`http://backend:8000`) — comunicação real contêiner-a-contêiner, não
  decorativa. (No navegador, o app chama `localhost:3000/api/v1`; quem traduz para `backend:8000` é o
  nginx, dentro da rede.) Isso também dispensa CORS no caminho de produção.
- **O banco NÃO é um contêiner local:** usamos o **PostgreSQL gerenciado do Supabase (nuvem)**. Isso
  atende ao **REQNF01** (arquitetura em nuvem) e simplifica o "funciona na minha máquina" (a equipe
  inteira aponta para o mesmo banco). **Não afirme** que o banco "sobe com o `docker compose up`" — ele
  não sobe; o compose orquestra os serviços da aplicação e o backend conecta no Supabase via `.env`.

### 7.3 Padronização e variáveis de ambiente
- `backend/.env` (gitignored) guarda `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`;
  `backend/.env.example` é o modelo público. O `JWT_SECRET` é gerado pela equipe
  (`python -c "import secrets; print(secrets.token_urlsafe(48))"`), **não** vem do Supabase.
- **Caso real do SSL/antivírus:** em Windows com inspeção de HTTPS, rodar o backend via venv falha com
  `CERTIFICATE_VERIFY_FAILED` ao conectar no Supabase. O contêiner Docker (Linux) não sofre essa
  interceptação → por isso **rodamos no Docker** (reforça o valor da conteinerização). O `config.py`
  ainda normaliza a `SUPABASE_URL` (remove `/rest/v1` acidental).
- **CI (`.github/workflows/ci.yml`)** roda `ruff check` + `pytest` a cada push/PR → **REQNF04**.

> 📝 **O que escrever no roteiro (§7):** explique as imagens base e as camadas dos **dois** Dockerfiles
> (backend `python:3.12-slim`; frontend multi-stage `node` → `nginx`); como o `docker-compose.yml`
> **coordena os serviços** `backend` e `frontend` na rede interna `cnh-net`, com o nginx fazendo proxy
> de `/api` para `http://backend:8000` (comunicação por nome de serviço); e o uso de variáveis de
> ambiente para segredos. Sobre a §7.2 do roteiro: **justifique** que o **PostgreSQL é gerenciado na
> nuvem (Supabase)** — por isso não é um contêiner local — e que essa é uma decisão de arquitetura que
> atende o **REQNF01**. Cite que o Docker resolveu um problema **real** de SSL e garante
> reprodutibilidade entre máquinas.
>
> Parágrafo pronto para colar/adaptar:
> > O `docker-compose.yml` coordena os serviços da aplicação — **backend** (FastAPI, porta 8000) e
> > **frontend** (app Expo Web exportado e servido por nginx, porta 3000) — na rede interna `cnh-net`.
> > O nginx do frontend repassa as chamadas `/api` ao backend pelo nome de serviço (`http://backend:8000`).
> > O **banco de dados PostgreSQL** é **gerenciado na nuvem (Supabase)**, e não um contêiner local —
> > decisão que atende o REQNF01 (arquitetura em nuvem); o backend conecta-se a ele por variáveis de
> > ambiente (`SUPABASE_URL`).

---

## 4. §8 — Camada de persistência (Banco de Dados)

Schema em `backend/db/0001_init.sql`, **normalizado até a 3FN** (ver `aula-7-db-resumo.md`).
Migrations rodadas no SQL Editor do Supabase, na ordem: `0001_init` → `0002_seed` → `0003_consultas`
→ `0004_views`. PK = `uuid`; FK no lado "Muitos".

### 8.1 Modelo relacional — 12 tabelas

| Tabela | Papel | PK / FKs principais |
|---|---|---|
| `users` | Pessoa (aluno/instrutor/admin) | PK `id`; UNIQUE `email`, `cpf` |
| `instructor_profiles` | Dados do instrutor (1:1 com users) | PK `id`; FK `user_id`→users (UNIQUE) |
| `categories` | Lookup de categorias (A, B) | PK `code` |
| `instructor_categories` | **Junção N:N** instrutor↔categoria | PK composta (`instructor_id`, `category_code`) |
| `availability_slots` | Horários do instrutor (1:N) | PK `id`; FK `instructor_id` |
| `bookings` | Solicitação/aula | PK `id`; FK `student_id`, `slot_id` |
| `lesson_reports` | Relatório pós-aula (1:1 com booking) | PK `id`; FK `booking_id` (UNIQUE) |
| `ratings` | Avaliação 5★ mútua | PK `id`; FK `booking_id` |
| `chat_messages` | Mensagens por aula | PK `id`; FK `booking_id`, `sender_id` |
| `payments` | Pagamento simulado (1:1 com booking) | PK `id`; FK `booking_id` (UNIQUE) |
| `notifications` | Avisos ao usuário | PK `id`; FK `user_id` |
| `audit_logs` | Trilha de auditoria (REQNF02) | PK `id`; FK `actor_user_id` |

> **Como obter o diagrama (ER) para o roteiro:** no painel do **Supabase**, abra **Database → Schema
> Visualizer** — ele desenha as tabelas com colunas e as ligações de FK; exporte/print para colar na
> §8.1. (O roteiro aceita *"diagrama **ou** script SQL"*: o [`0001_init.sql`](../backend/db/0001_init.sql)
> também serve como fonte. Onde o roteiro cita o "DBeaver", usamos o equivalente do Supabase, que é o
> nosso banco.)

**Detalhamento das tabelas principais** (modelo pedido pela §8.1 — `Coluna · Tipo · Restrições ·
Descrição`). Abaixo, uma tabela-base (`users`) e uma de relacionamento (`bookings`); as demais seguem o
mesmo padrão no `0001_init.sql`.

**Tabela `users`** (pessoa: aluno, instrutor ou admin):

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `uuid` | **PK**, default `gen_random_uuid()` | Identificador único e imutável do usuário |
| `role` | `text` | NOT NULL, CHECK `in ('student','instructor','admin')` | Papel da pessoa no sistema |
| `full_name` | `text` | NOT NULL | Nome completo |
| `email` | `text` | NOT NULL, **UNIQUE** | E-mail de login, único no banco |
| `phone` | `text` | NOT NULL | Telefone de contato |
| `cpf` | `varchar(11)` | NOT NULL, **UNIQUE**, CHECK `char_length(cpf)=11` | CPF único — impede cadastros duplicados |
| `password_hash` | `text` | NOT NULL | Hash **bcrypt** da senha (nunca a senha em texto) |
| `meeting_address` | `text` | — | Ponto de encontro padrão do aluno (REQ01) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Data de criação do registro |

**Tabela `bookings`** (solicitação/aula — exemplo de relacionamento):

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `uuid` | **PK**, default `gen_random_uuid()` | Identificador único da solicitação |
| `student_id` | `uuid` | **FK** → `users(id)`, NOT NULL | Aluno que solicitou (integridade referencial) |
| `slot_id` | `uuid` | **FK** → `availability_slots(id)`, NOT NULL | Horário reservado; o **instrutor é derivado daqui** (3FN, sem coluna redundante) |
| `vehicle_modality` | `text` | NOT NULL, CHECK `in ('own','instructor')` | De quem é o veículo da aula |
| `status` | `text` | NOT NULL, CHECK `in ('awaiting_confirmation','confirmed','cancelled','completed')` | Estado da reserva |
| `price` | `numeric(10,2)` | NOT NULL, CHECK `>= 0` | *Snapshot* do preço no momento da solicitação (REQ09) |
| `meeting_address` | `text` | — | Endereço revelado ao instrutor só após confirmar (REQ07) |
| `confirmed_at` | `timestamptz` | — | Quando a reserva foi confirmada |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Data da solicitação |

> Índice único parcial `uq_booking_slot_confirmed` em `bookings(slot_id) where status='confirmed'`
> garante que **um slot só tenha uma reserva confirmada** por vez (ver §8.2).

**Defesa para os professores (decisões de modelagem):**
- **1FN (valores atômicos):** as categorias do instrutor **não** são uma lista numa coluna — viraram a
  tabela `instructor_categories`.
- **N:N → tabela de junção:** instrutor↔categoria é N:N, resolvido com `instructor_categories` (PK
  composta) = dois relacionamentos 1:N.
- **3FN (sem campos calculados):** `avg_rating`, `total_lessons` e `% de reembolso` **não** são colunas
  — são **derivados em runtime** (é por isso que as consultas da §8.3 existem).
- **3FN (sem dependência transitiva):** `bookings` **não** guarda `instructor_id` (ele vem do `slot`).
- **Primary Key:** Usamos para para PK somente uuid, diferente do roteiro que citava SERIAL/INT.


### 8.2 Integridade e restrições (constraints)

Regras de negócio movidas para o banco:
- **UNIQUE:** `users.email`, `users.cpf`, `instructor_profiles.user_id`, `lesson_reports.booking_id`,
  `payments.booking_id`, `ratings(booking_id, rater_role)` (cada lado avalia uma vez).
- **CHECK:** `role`/`status`/`method`/`msg_type` em domínios fechados; `stars` 0–5; notas
  (baliza/percurso/embreagem) 0–10; `price > 0`; `char_length(cpf) = 11`; `end_at > start_at`.
- **FK:** integridade referencial em todas as relações (com `on delete cascade` onde faz sentido).
- **Regras de negócio no próprio banco:**
  - `chk_vehicle_docs` — se `provides_vehicle = true`, então `crlv_url` e `vehicle_photo_url` são
    obrigatórios (REQ02).
  - índice parcial `uq_booking_slot_confirmed` — um slot só pode ter **uma** reserva confirmada.
- **Exemplo (§8.2):** o banco impede dois usuários com o mesmo CPF pela constraint `UNIQUE` em `cpf`.

### 8.3 Consultas de negócio (SELECT + JOIN + GROUP BY)

As 3 consultas (`backend/db/0003_consultas_negocio.sql`) **derivam** a inteligência que a 3FN nos
proíbe de armazenar — esse é o argumento que liga a §8.3 à §8.1/8.2.

> **Como rodar na apresentação:** no painel do **Supabase**, abra **SQL Editor → New query**, cole
> **um** dos blocos abaixo (um de cada vez) e clique **Run** (ou `Ctrl+Enter`). O resultado aparece na
> grade embaixo — é o "print de exemplo" do roteiro. Pré-requisito: o seed (`0002_seed.sql`) já ter sido
> rodado. As consultas são **somente leitura** (`SELECT`), então pode rodar à vontade.

**Q1 — Ranking de instrutores (nota média + nº de aulas).** Junta `instructor_profiles → users →
availability_slots → bookings → ratings`; `LEFT JOIN` mantém instrutores sem aulas; `GROUP BY` colapsa
em uma linha por instrutor. *Valor:* alimenta os filtros "ordenar por nota" e "aulas concluídas" do REQ03.

```sql
SELECT u.full_name AS instrutor,
       ip.region,
       ROUND(AVG(r.stars), 2) AS nota_media,
       COUNT(DISTINCT b.id) FILTER (WHERE b.status IN ('confirmed', 'completed')) AS aulas
FROM instructor_profiles ip
JOIN users u ON u.id = ip.user_id
LEFT JOIN availability_slots s ON s.instructor_id = ip.id
LEFT JOIN bookings b ON b.slot_id = s.id
LEFT JOIN ratings r ON r.booking_id = b.id AND r.rater_role = 'student'
GROUP BY ip.id, u.full_name, ip.region
ORDER BY nota_media DESC NULLS LAST;
```

**Q2 — Dashboard de evolução do aluno (médias das 3 competências).** Junta `lesson_reports → bookings
→ users`; `GROUP BY` por aluno. *Valor:* é o Dashboard de Evolução (REQ05/REQ08) e a base da
probabilidade de aprovação.

```sql
SELECT u.full_name AS aluno,
       ROUND(AVG(lr.baliza), 1)    AS media_baliza,
       ROUND(AVG(lr.percurso), 1)  AS media_percurso,
       ROUND(AVG(lr.embreagem), 1) AS media_embreagem,
       COUNT(*) AS aulas_avaliadas
FROM lesson_reports lr
JOIN bookings b ON b.id = lr.booking_id
JOIN users u    ON u.id = b.student_id
GROUP BY u.id, u.full_name;
```

**Q3 — Aulas confirmadas por região.** Junta `bookings → availability_slots → instructor_profiles`
filtrando `status='confirmed'`; `GROUP BY region`. *Valor:* visão operacional/admin da demanda.

```sql
SELECT ip.region, COUNT(*) AS aulas_confirmadas
FROM bookings b
JOIN availability_slots s   ON s.id = b.slot_id
JOIN instructor_profiles ip ON ip.id = s.instructor_id
WHERE b.status = 'confirmed'
GROUP BY ip.region
ORDER BY aulas_confirmadas DESC;
```

**Resultados reais com o seed (use como print de exemplo):** João nota **5,0** / **1** aula · Vicente
médias **baliza 4 · percurso 7 · embreagem 6** · região **Pinheiros = 1** aula confirmada.

> **View `instructor_cards` (`0004_views.sql`):** concentra a agregação do card de busca (categorias,
> nota média, total de aulas). Uma **view é calculada, não armazena dados** → não fere a 3FN. No
> Supabase ela aparece como "Unrestricted" porque views não têm RLS próprio; isso **não** é problema
> aqui (o backend usa `service_role` e o app nunca acessa o Supabase direto). Hardening opcional para a
> narrativa de LGPD: um `0005_rls.sql` ligando RLS nas tabelas sensíveis (ex.: `users`).

> 📝 **O que escrever no roteiro (§8):**
> - **§8.1:** cole o **diagrama ER** (Supabase → Database → Schema Visualizer) **ou** o script SQL do
>   `0001_init.sql`, identificando **PK e FK**; e inclua as tabelas detalhadas por coluna (`users` e
>   `bookings` acima seguem o modelo do roteiro).
> - **§8.2:** liste as constraints (NOT NULL, UNIQUE, CHECK, FK) com o **exemplo do CPF UNIQUE** e a
>   regra de negócio `chk_vehicle_docs`.
> - **§8.3:** apresente as **3 consultas** (SELECT + JOIN + GROUP BY) com os **resultados do seed**.
> - Reforce a **defesa 1FN/N:N/3FN** ao longo da seção.

---

## 5. §9 — Conclusão do Ciclo 2

- **De protótipo volátil a aplicação persistente:** no Ciclo 1 tínhamos telas Streamlit sem estado; no
  Ciclo 2 temos uma **API profissional em camadas + banco relacional persistente (Supabase) + app
  mobile** que sobrevive a reinícios e é compartilhado pela equipe.
- **Como Docker + Supabase garantem os NFRs:**
  - **REQNF01 (escalabilidade/nuvem):** Postgres gerenciado em nuvem.
  - **REQNF02 (segurança/LGPD):** segurança aplicada no código (filtragem por ID de usuário), trilha de
    auditoria (`audit_logs`) e regra de **não logar** dados sensíveis (CPF/CNH/CRLV/endereço).
  - **REQNF03 (manutenibilidade):** arquitetura modular em camadas com interfaces bem definidas.
  - **REQNF04 (CI):** pipeline GitHub Actions com lint + testes a cada push.
- **Decisões de arquitetura a registrar:**
  - Evoluímos **além** do Streamlit citado no roteiro: o frontend final é um **app mobile real (Expo)**.
  - Backend usa `service_role` e faz a segurança no código (decisão documentada nos skills).
  - **3 problemas reais resolvidos:** (1) cliente Supabase criado no import quebrava os testes → tornado
    *lazy*; (2) chave nova `sb_secret_` rejeitada → uso da `service_role` legada (JWT); (3) SSL bloqueado
    pelo antivírus → execução via Docker + normalização da `SUPABASE_URL`.
- **Próximos passos:** `0005_rls.sql` (LGPD), IA real (ML) no lugar da heurística, gateway de pagamento
  real, e observabilidade (logs estruturados/métricas/alertas) para fechar o REQNF04.

---

## 6. Apêndice — validações executadas e pendências

**Validações automáticas já rodadas:**

| Verificação | Resultado |
|---|---|
| Backend `ruff check` | ✅ All checks passed |
| Backend `pytest` | ✅ 14 testes (política de reembolso, regra dos 8 dias, validações) |
| App `tsc --noEmit` (após repaginação visual) | ✅ exit 0 |
| App `expo export --platform web` (após repaginação) | ✅ bundle compila |
| Repaginação Apple-clean: design system + **17 telas** migradas | ✅ zero emoji/placeholder; biblioteca em `components/` |
| Build da imagem do frontend (`docker compose build frontend`) | ✅ multi-stage node→nginx, exit 0 |
| Smoke HTTP aluno (login, /users/me, search, dashboard, bookings) | ✅ |
| Smoke HTTP instrutor (/instructors/me, bookings, chat) | ✅ |
| `docker compose up` integrado (backend `:8000` + frontend `:3000`) | ✅ ambos `Up` |
| App servido pelo nginx (`GET localhost:3000/`) | ✅ HTTP 200 (index.html) |
| Proxy reverso (`GET localhost:3000/api/v1/health` → contêiner backend) | ✅ HTTP 200 `{"status":"ok"}` |
| Swagger (`GET localhost:8000/docs`) | ✅ HTTP 200 (Swagger UI) |

**Pendências / decisões em aberto:**
- `0005_rls.sql` (RLS nas tabelas sensíveis) — opcional, recomendado para a narrativa de LGPD.
- Teste visual clicando pelos fluxos no navegador (o app já compila e o contrato com a API foi
  validado endpoint a endpoint).

**Arquivos de referência:** [`backend/db/0001_init.sql`](../backend/db/0001_init.sql) ·
[`0003_consultas_negocio.sql`](../backend/db/0003_consultas_negocio.sql) ·
[`0004_views.sql`](../backend/db/0004_views.sql) · [`backend/Dockerfile`](../backend/Dockerfile) ·
[`frontend/Dockerfile`](../frontend/Dockerfile) · [`frontend/nginx.conf`](../frontend/nginx.conf) ·
[`docker-compose.yml`](../docker-compose.yml) · [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) ·
[`docs/requisitos.md`](requisitos.md) · [`CLAUDE.md`](../CLAUDE.md).
