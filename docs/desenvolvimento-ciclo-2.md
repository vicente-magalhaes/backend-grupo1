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
# Terminal 1 — backend (NÃO precisa de venv)
docker compose up

# Terminal 2 — app (NÃO precisa de venv)
cd frontend
$env:NODE_OPTIONS = "--use-system-ca"
npx expo start --web
```
- **Usuários de demonstração** (senha `senha123`): aluno `vicente@aluno.com` · instrutor `joao@instrutor.com`.
- **URLs úteis:** `http://localhost:8000/docs` (Swagger — a API) · `http://localhost:8000/api/v1/health` (health check) · `http://localhost:8081` (app Expo).
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

O backend é um **monólito modular** com camadas de responsabilidade única (definidas em
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

**Por que backend e frontend rodam em processos separados:** o app mobile (Expo) é cliente; ele **só
conversa com a API** por HTTP/JSON com token JWT. **Apenas o backend** conhece as credenciais do banco
e aplica as regras de segurança — o app nunca toca no Supabase direto. Isso isola responsabilidades,
permite trocar/escalar cada parte de forma independente (REQNF03) e mantém os segredos fora do cliente.

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

> 📝 **O que escrever no roteiro (§6):** descreva o monólito modular em camadas e por que app/back rodam
> separados; cole a tabela de endpoints acima; mostre um print do `/docs` e explique que ele garantiu
> que o frontend consumisse os dados corretamente (contrato).

---

## 3. §7 — Infraestrutura e conteinerização (Docker)

### 7.1 Receita de construção (`backend/Dockerfile`)
- Imagem base **`python:3.12-slim`**; `WORKDIR /app`.
- Copia o `requirements.txt` e instala **antes** do código (camada cacheável → builds mais rápidos).
- Copia o código e sobe com `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
- `backend/.dockerignore` evita copiar `venv/`, caches e **`.env`** (segredos) para a imagem.

### 7.2 Orquestração (`docker-compose.yml`)
- Serviço **`backend`**: `build ./backend`, porta `8000:8000`, `env_file: ./backend/.env`.
- Rede interna **`cnh-net`** (bridge): serviços futuros se comunicam pelo nome (ex.: `http://backend:8000`).
- **O banco NÃO é um contêiner local:** usamos o **PostgreSQL gerenciado do Supabase (nuvem)**. Isso
  atende ao **REQNF01** (arquitetura em nuvem) e simplifica o "funciona na minha máquina" (a equipe
  inteira aponta para o mesmo banco).

### 7.3 Padronização e variáveis de ambiente
- `backend/.env` (gitignored) guarda `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`;
  `backend/.env.example` é o modelo público. O `JWT_SECRET` é gerado pela equipe
  (`python -c "import secrets; print(secrets.token_urlsafe(48))"`), **não** vem do Supabase.
- **Caso real do SSL/antivírus:** em Windows com inspeção de HTTPS, rodar o backend via venv falha com
  `CERTIFICATE_VERIFY_FAILED` ao conectar no Supabase. O contêiner Docker (Linux) não sofre essa
  interceptação → por isso **rodamos no Docker** (reforça o valor da conteinerização). O `config.py`
  ainda normaliza a `SUPABASE_URL` (remove `/rest/v1` acidental).
- **CI (`.github/workflows/ci.yml`)** roda `ruff check` + `pytest` a cada push/PR → **REQNF04**.

> 📝 **O que escrever no roteiro (§7):** explique a imagem base e as camadas do Dockerfile; o
> `docker-compose` com a rede interna `cnh-net`; e o uso de variáveis de ambiente para segredos. Cite
> que o Docker resolveu um problema **real** de SSL e garante reprodutibilidade entre máquinas.

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

> Para o roteiro: abra o schema no **DBeaver** e gere o **diagrama (ER)** para colar na §8.1 — ele
> mostra colunas e constraints prontas.

**Defesa para os professores (decisões de modelagem):**
- **1FN (valores atômicos):** as categorias do instrutor **não** são uma lista numa coluna — viraram a
  tabela `instructor_categories`.
- **N:N → tabela de junção:** instrutor↔categoria é N:N, resolvido com `instructor_categories` (PK
  composta) = dois relacionamentos 1:N.
- **3FN (sem campos calculados):** `avg_rating`, `total_lessons` e `% de reembolso` **não** são colunas
  — são **derivados em runtime** (é por isso que as consultas da §8.3 existem).
- **3FN (sem dependência transitiva):** `bookings` **não** guarda `instructor_id` (ele vem do `slot`).

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

**Q1 — Ranking de instrutores (nota média + nº de aulas).** Junta `instructor_profiles → users →
availability_slots → bookings → ratings`; `LEFT JOIN` mantém instrutores sem aulas; `GROUP BY` colapsa
em uma linha por instrutor. *Valor:* alimenta os filtros "ordenar por nota" e "aulas concluídas" do REQ03.

**Q2 — Dashboard de evolução do aluno (médias das 3 competências).** Junta `lesson_reports → bookings
→ users`; `GROUP BY` por aluno. *Valor:* é o Dashboard de Evolução (REQ05/REQ08) e a base da
probabilidade de aprovação.

**Q3 — Aulas confirmadas por região.** Junta `bookings → availability_slots → instructor_profiles`
filtrando `status='confirmed'`; `GROUP BY region`. *Valor:* visão operacional/admin da demanda.

**Resultados reais com o seed (use como print de exemplo):** João nota **5,0** / **1** aula · Vicente
médias **baliza 4 · percurso 7 · embreagem 6** · região **Pinheiros = 1** aula confirmada.

> **View `instructor_cards` (`0004_views.sql`):** concentra a agregação do card de busca (categorias,
> nota média, total de aulas). Uma **view é calculada, não armazena dados** → não fere a 3FN. No
> Supabase ela aparece como "Unrestricted" porque views não têm RLS próprio; isso **não** é problema
> aqui (o backend usa `service_role` e o app nunca acessa o Supabase direto). Hardening opcional para a
> narrativa de LGPD: um `0005_rls.sql` ligando RLS nas tabelas sensíveis (ex.: `users`).

> 📝 **O que escrever no roteiro (§8):** cole o diagrama do DBeaver; liste PK/FK e constraints (com o
> exemplo do CPF UNIQUE e da regra `chk_vehicle_docs`); e apresente as 3 consultas com os resultados do
> seed. Reforce a defesa 1FN/N:N/3FN acima.

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
| App `tsc --noEmit` | ✅ exit 0 |
| App `expo export --platform web` | ✅ bundle (584 módulos) |
| Smoke HTTP aluno (login, /users/me, search, dashboard, bookings) | ✅ |
| Smoke HTTP instrutor (/instructors/me, bookings, chat) | ✅ |
| `docker compose up` + `/health` + `/docs` | ✅ |

**Pendências / decisões em aberto:**
- `0005_rls.sql` (RLS nas tabelas sensíveis) — opcional, recomendado para a narrativa de LGPD.
- Teste visual clicando pelos fluxos no navegador (o app já compila e o contrato com a API foi
  validado endpoint a endpoint).

**Arquivos de referência:** [`backend/db/0001_init.sql`](../backend/db/0001_init.sql) ·
[`0003_consultas_negocio.sql`](../backend/db/0003_consultas_negocio.sql) ·
[`0004_views.sql`](../backend/db/0004_views.sql) · [`backend/Dockerfile`](../backend/Dockerfile) ·
[`docker-compose.yml`](../docker-compose.yml) · [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) ·
[`docs/requisitos.md`](requisitos.md) · [`CLAUDE.md`](../CLAUDE.md).
