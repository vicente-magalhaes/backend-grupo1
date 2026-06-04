-- ============================================================================
-- CNH Connect — Migration 0001 (schema inicial)
-- PostgreSQL / Supabase. Normalizado até a 3FN (ver aula-7-db-resumo.md).
--   • PK = UUID (gen_random_uuid)         • FK no lado "Muitos"
--   • Sem arrays (1FN)                    • N:N via tabela de junção
--   • Sem campos calculados/derivados armazenados (3FN)
-- Idempotente: pode rodar novamente (DROP ... IF EXISTS no topo).
-- ============================================================================

-- Limpeza (ordem inversa das dependências) — facilita re-execução em dev
drop table if exists audit_logs       cascade;
drop table if exists notifications    cascade;
drop table if exists payments         cascade;
drop table if exists chat_messages    cascade;
drop table if exists ratings          cascade;
drop table if exists lesson_reports   cascade;
drop table if exists bookings         cascade;
drop table if exists availability_slots cascade;
drop table if exists instructor_categories cascade;
drop table if exists categories       cascade;
drop table if exists instructor_profiles cascade;
drop table if exists users            cascade;

-- ── users ───────────────────────────────────────────────────────────────────
-- Entidade central. Um registro por pessoa (aluno, instrutor ou admin).
create table users (
    id              uuid primary key default gen_random_uuid(),
    role            text not null check (role in ('student', 'instructor', 'admin')),
    full_name       text not null,
    email           text not null unique,
    phone           text not null,
    cpf             varchar(11) not null unique check (char_length(cpf) = 11),
    password_hash   text not null,
    meeting_address text,                         -- ponto de encontro padrão do aluno (REQ01)
    created_at      timestamptz not null default now()
);

-- ── instructor_profiles ─────────────────────────────────────────────────────
-- Dados específicos de quem é instrutor (1:1 com users). REQ02.
-- avg_rating / total_lessons NÃO existem aqui (3FN: calculados em runtime).
create table instructor_profiles (
    id               uuid primary key default gen_random_uuid(),
    user_id          uuid not null unique references users(id) on delete cascade,
    status           text not null default 'pending'
                         check (status in ('pending', 'approved', 'rejected')),
    provides_vehicle boolean not null default false,
    cnh_url          text,                        -- documento obrigatório (validado na aplicação)
    credential_url   text,                        -- credencial oficial
    crlv_url         text,                        -- exigido só se provides_vehicle
    vehicle_photo_url text,                       -- exigido só se provides_vehicle
    teaching_method  text,
    price            numeric(10, 2) not null check (price > 0),
    region           text not null,
    created_at       timestamptz not null default now(),
    -- Regra de negócio no banco: veículo próprio exige CRLV + foto (REQ02)
    constraint chk_vehicle_docs check (
        provides_vehicle = false
        or (crlv_url is not null and vehicle_photo_url is not null)
    )
);

-- ── categories (lookup) ─────────────────────────────────────────────────────
create table categories (
    code        text primary key check (code in ('A', 'B')),
    description text not null
);

-- ── instructor_categories (JUNÇÃO N:N) ──────────────────────────────────────
-- Resolve o N:N instrutor↔categoria (1FN). PK composta = dois 1:N.
create table instructor_categories (
    instructor_id uuid not null references instructor_profiles(id) on delete cascade,
    category_code text not null references categories(code),
    primary key (instructor_id, category_code)
);

-- ── availability_slots ──────────────────────────────────────────────────────
-- Janelas de horário do instrutor (1:N a partir de instructor_profiles). REQ03.
create table availability_slots (
    id            uuid primary key default gen_random_uuid(),
    instructor_id uuid not null references instructor_profiles(id) on delete cascade,
    start_at      timestamptz not null,
    end_at        timestamptz not null,
    status        text not null default 'free'
                      check (status in ('free', 'reserved', 'blocked')),
    constraint chk_slot_interval check (end_at > start_at)
);

-- ── bookings ────────────────────────────────────────────────────────────────
-- Solicitação/aula. O instrutor é obtido via slot (3FN: sem coluna redundante).
-- price e meeting_address são SNAPSHOTS do momento da solicitação (REQ07/REQ09).
create table bookings (
    id               uuid primary key default gen_random_uuid(),
    student_id       uuid not null references users(id),
    slot_id          uuid not null references availability_slots(id),
    vehicle_modality text not null check (vehicle_modality in ('own', 'instructor')),
    status           text not null default 'awaiting_confirmation'
                         check (status in ('awaiting_confirmation', 'confirmed',
                                           'cancelled', 'completed')),
    price            numeric(10, 2) not null check (price >= 0),
    meeting_address  text,                        -- revelado ao instrutor só após confirmar (REQ07)
    created_at       timestamptz not null default now(),
    confirmed_at     timestamptz
);
-- Integridade: um slot só pode ter UMA reserva confirmada simultânea.
create unique index uq_booking_slot_confirmed
    on bookings (slot_id) where status = 'confirmed';

-- ── lesson_reports ──────────────────────────────────────────────────────────
-- Relatório pós-aula (1:1 com booking). REQ08. Alimenta a IA (REQ05).
create table lesson_reports (
    id          uuid primary key default gen_random_uuid(),
    booking_id  uuid not null unique references bookings(id) on delete cascade,
    baliza      smallint not null check (baliza between 0 and 10),
    percurso    smallint not null check (percurso between 0 and 10),
    embreagem   smallint not null check (embreagem between 0 and 10),
    observations text,
    strengths   text,                             -- pontos fortes (entrada da IA)
    weaknesses  text,                             -- pontos a melhorar (entrada da IA)
    created_at  timestamptz not null default now()
);

-- ── ratings ─────────────────────────────────────────────────────────────────
-- Avaliação 5 estrelas mútua liberada no chat após a aula (REQ06).
create table ratings (
    id          uuid primary key default gen_random_uuid(),
    booking_id  uuid not null references bookings(id) on delete cascade,
    rater_role  text not null check (rater_role in ('student', 'instructor')),
    stars       smallint not null check (stars between 0 and 5),
    created_at  timestamptz not null default now(),
    constraint uq_rating_per_side unique (booking_id, rater_role)  -- cada lado avalia 1x
);

-- ── chat_messages ───────────────────────────────────────────────────────────
-- Chat por booking, liberado após a solicitação (REQ06). msg_type=location p/ REQ07.
create table chat_messages (
    id          uuid primary key default gen_random_uuid(),
    booking_id  uuid not null references bookings(id) on delete cascade,
    sender_id   uuid not null references users(id),
    content     text not null,
    msg_type    text not null default 'text' check (msg_type in ('text', 'location')),
    created_at  timestamptz not null default now()
);

-- ── payments ────────────────────────────────────────────────────────────────
-- Pagamento simulado (REQ09). 1:1 com booking. % de reembolso é calculado na app.
create table payments (
    id          uuid primary key default gen_random_uuid(),
    booking_id  uuid not null unique references bookings(id) on delete cascade,
    amount      numeric(10, 2) not null check (amount >= 0),
    method      text not null check (method in ('credit', 'debit', 'pix')),
    status      text not null default 'pending'
                    check (status in ('pending', 'paid', 'refunded')),
    created_at  timestamptz not null default now()
);

-- ── notifications ───────────────────────────────────────────────────────────
create table notifications (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references users(id) on delete cascade,
    type        text not null,
    message     text not null,
    read        boolean not null default false,
    created_at  timestamptz not null default now()
);

-- ── audit_logs ──────────────────────────────────────────────────────────────
-- Trilha de auditoria (REQNF02): quem acessou/alterou o quê e quando.
create table audit_logs (
    id            uuid primary key default gen_random_uuid(),
    actor_user_id uuid references users(id),
    action        text not null,
    entity        text not null,
    entity_id     uuid,
    created_at    timestamptz not null default now()
);

-- ── Índices de apoio às consultas de negócio (§8.3) ─────────────────────────
create index idx_slots_instructor on availability_slots (instructor_id);
create index idx_bookings_student  on bookings (student_id);
create index idx_bookings_slot     on bookings (slot_id);
create index idx_chat_booking      on chat_messages (booking_id);
create index idx_ratings_booking   on ratings (booking_id);
