# CLAUDE.md — CNH Connect

Guia de contexto para agentes de IA neste repositório. Leia antes de codar.

## Produto
**CNH Connect** — marketplace que conecta **instrutores autônomos de trânsito** a **candidatos à CNH**,
viabilizado pela Resolução CONTRAN 1020/2025 (fim da obrigatoriedade das autoescolas). Disciplina
PRO3151 (Poli/USP), Grupo 01. Estamos no **Ciclo 2** (desenvolvimento real). Tudo roda **localmente**.

## Stack
- **Backend:** Python 3.12 + FastAPI (monólito modular). Único componente que fala com o banco.
- **Banco:** Supabase (PostgreSQL gerenciado em nuvem). Acesso via `supabase-py` com `service_role`.
- **Frontend:** Expo / React Native (app mobile). Fala **somente** com a API FastAPI (nunca com o Supabase direto).
- **Infra:** Docker + Docker Compose. CI no GitHub Actions (ruff + pytest).

## Âncora de contexto (OBRIGATÓRIO)
Antes de implementar qualquer funcionalidade, leia o documento de requisitos
[`docs/requisitos.md`](docs/requisitos.md) e mapeie o `REQ`/`REQNF` correspondente.
**Nunca invente** regras de negócio, campos de banco ou lógica que não estejam nos requisitos —
em caso de lacuna, **pergunte** antes de codar. (ver `.agent/skills/50-workflow.md`)

## Regras de arquitetura (de `.agent/skills/`, tratadas como lei)
- **Camadas** (`10-fastapi-architecture.md`):
  - `app/api/` → routers (só Request/Response HTTP; **proibido** lógica de negócio ou acesso a banco).
  - `app/schemas/` → modelos Pydantic (validação de entrada/saída).
  - `app/services/` → regras de negócio puras (**proibido** importar `fastapi` aqui).
  - `app/repositories/` → acesso exclusivo ao Supabase.
  - `app/core/` → config, errors, handlers, segurança (JWT).
  - `app/main.py` → só inicializa app, middlewares, routers.
- **Erros:** services lançam exceções de domínio (`NotFoundError`, `ConflictError`, `ForbiddenError`
  em `core/errors.py`); handlers globais em `core/handlers.py` convertem para HTTP.
- **Supabase** (`20-supabase-access.md`): toda query termina com `.execute()`; dados em `response.data`;
  UUID sempre `str(...)`. Como usamos `service_role` (RLS ignorado), **toda** query de dado privado
  DEVE filtrar por ID no código (`student_id`/`instructor_id`). Proibido endpoint que liste dados
  sensíveis sem filtro de usuário.
- **Segurança/LGPD** (`30-security-lgpd.md`): CPF, CNH, CRLV e endereços são sensíveis — **nunca** logar
  esses valores. Logs referenciam só IDs (`user_id`, `booking_id`). Documentos ficam em bucket privado
  no Supabase Storage; backend gera signed URLs de expiração curta.
- **Qualidade** (`40-quality-ci.md`): `ruff` para lint/format; `pytest` com foco em `services/`.

## Modelo de dados
Normalizado até a **3FN** (ver `aula-7-db-resumo.md`): sem arrays (1FN), N:N em tabela de junção
(`instructor_categories`), sem campos calculados armazenados (`avg_rating`, `total_lessons`, `% reembolso`
são computados em runtime). Migration em `backend/db/`. PK = UUID; FK no lado "Muitos".

## Escopo de implementação (Ciclo 2)
- **Real:** REQ01 cadastro, REQ02 perfil instrutor, REQ03 busca/agendamento, REQ04 gestão de
  solicitações, REQ08 relatório de aula, REQ06 chat.
- **Mock/simplificado:** REQ05 IA (heurística), REQ07 visibilidade de endereço (regra no dado, sem mapa),
  REQ09 pagamento (simulado, com estados pendente→pago→reembolsado).

## Comandos

### Backend (local)
```powershell
cd backend
python -m venv venv; .\venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env                               # preencher SUPABASE_URL, SERVICE_ROLE_KEY, JWT_SECRET
uvicorn app.main:app --reload                        # http://localhost:8000  | docs em /docs
```

### Backend (Docker) — forma recomendada de rodar
```powershell
docker compose up --build                            # sobe a API em http://localhost:8000
```
> ⚠️ Em máquinas Windows com antivírus/proxy que inspeciona HTTPS (SSL interception),
> rodar via venv pode falhar ao conectar no Supabase com
> `CERTIFICATE_VERIFY_FAILED`. O contêiner Docker (Linux) não sofre essa interceptação,
> então **prefira `docker compose up`**. Isso reforça o valor do Docker (REQNF / "na minha
> máquina funcionou"). A `SUPABASE_URL` deve ser a base do projeto
> (`https://<ref>.supabase.co`), sem `/rest/v1` — o config normaliza, mas evite colar errado.

### Qualidade e testes
```powershell
cd backend
ruff check .          # lint
ruff format .         # format
pytest                # testes (foco em services/)
```

### Frontend (Expo)
```powershell
cd frontend
npm install
npx expo start                                       # abrir no Expo Go (celular) ou emulador
```

### Gerar JWT_SECRET
```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

## Git Flow
- `main` (produção, sempre estável) ← `dev` (integração) ← `feature/<tarefa>`.
- Nunca commitar direto na `main`. PRs entram via `dev`. Detalhes no [README.md](README.md).
- `.env` é **gitignored** — nunca subir segredos.
