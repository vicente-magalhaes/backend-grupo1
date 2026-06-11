-- ============================================================================
-- CNH Connect — Seed 0005 (dados extras + refresh de horários)
-- ----------------------------------------------------------------------------
-- POR QUE ESTE ARQUIVO EXISTE:
--   Os horários do 0002_seed.sql usam now() + interval, que fica FIXO quando o
--   seed roda. A regra dos 8 dias (REQ03 / MIN_LESSON_LEAD_HOURS=192h) esconde
--   da busca qualquer aula com início em < 8 dias. Com o tempo, os slots do
--   seed "vencem" e todo instrutor passa a mostrar "Sem horários disponíveis".
--
-- O QUE FAZ:
--   1. APAGA todos os slots 'free' e os repovoa com datas SEMPRE FRESCAS
--      (10 a 30 dias à frente), para todos os instrutores aprovados.
--   2. Adiciona mais dados fake: 3 instrutores, 2 alunos, aulas concluídas e
--      avaliações — para a busca e os cards (nota/nº de aulas) ficarem cheios.
--
-- COMO USAR (Supabase → SQL Editor): cole TUDO e execute. É IDEMPOTENTE:
--   pode rodar quantas vezes quiser. Rode-o sempre antes de uma demo para
--   garantir horários válidos. (Apagar 'free' é seguro: slot livre nunca tem
--   booking associado — ao solicitar, o slot vira 'reserved'.)
-- Pré-requisito: 0001_init.sql + 0002_seed.sql já aplicados. Senha: senha123.
-- ============================================================================

-- ── 1) Novos usuários (instrutores e alunos) — senha123 ─────────────────────
-- hash: $2b$12$LzNceMwIJB.Edz.ka0WK8.M1UE.B14lyAWi9aFRYX.YnieP/Hq2TO
insert into users (id, role, full_name, email, phone, cpf, password_hash, meeting_address) values
    ('22222222-2222-2222-2222-222222222223', 'instructor', 'Carlos Mendes',
     'carlos@instrutor.com', '11988880003', '66666666666',
     '$2b$12$LzNceMwIJB.Edz.ka0WK8.M1UE.B14lyAWi9aFRYX.YnieP/Hq2TO', null),
    ('22222222-2222-2222-2222-222222222224', 'instructor', 'Beatriz Rocha',
     'beatriz@instrutor.com', '11988880004', '77777777777',
     '$2b$12$LzNceMwIJB.Edz.ka0WK8.M1UE.B14lyAWi9aFRYX.YnieP/Hq2TO', null),
    ('22222222-2222-2222-2222-222222222225', 'instructor', 'Rafael Tavares',
     'rafael@instrutor.com', '11988880005', '88888888888',
     '$2b$12$LzNceMwIJB.Edz.ka0WK8.M1UE.B14lyAWi9aFRYX.YnieP/Hq2TO', null),
    ('11111111-1111-1111-1111-111111111113', 'student', 'Pedro Alves',
     'pedro@aluno.com', '11999990003', '99999999999',
     '$2b$12$LzNceMwIJB.Edz.ka0WK8.M1UE.B14lyAWi9aFRYX.YnieP/Hq2TO',
     'Rua Harmonia, 200 - Vila Madalena, São Paulo'),
    ('11111111-1111-1111-1111-111111111114', 'student', 'Juliana Castro',
     'juliana@aluno.com', '11999990004', '10101010101',
     '$2b$12$LzNceMwIJB.Edz.ka0WK8.M1UE.B14lyAWi9aFRYX.YnieP/Hq2TO',
     'Rua Domingos de Morais, 800 - Vila Mariana, São Paulo')
on conflict do nothing;

-- ── 2) Perfis dos novos instrutores (aprovados) ─────────────────────────────
-- Carlos e Rafael têm veículo próprio → exigem crlv_url + vehicle_photo_url.
insert into instructor_profiles
    (id, user_id, status, provides_vehicle, cnh_url, credential_url, crlv_url,
     vehicle_photo_url, teaching_method, price, region) values
    ('aaaaaaaa-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222223',
     'approved', true, 'docs/carlos/cnh.pdf', 'docs/carlos/credencial.pdf',
     'docs/carlos/crlv.pdf', 'docs/carlos/veiculo.jpg',
     'Aulas práticas em zona norte. Foco em segurança e baliza.', 90.00, 'Santana'),
    ('aaaaaaaa-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222224',
     'approved', false, 'docs/beatriz/cnh.pdf', 'docs/beatriz/credencial.pdf',
     null, null, 'Instrutora paciente, especialista em primeira habilitação.',
     150.00, 'Pinheiros'),
    ('aaaaaaaa-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222225',
     'approved', true, 'docs/rafael/cnh.pdf', 'docs/rafael/credencial.pdf',
     'docs/rafael/crlv.pdf', 'docs/rafael/veiculo.jpg',
     'Direção defensiva e preparação para a prova do Detran-SP.', 110.00, 'Tatuapé')
on conflict do nothing;

-- ── 3) Categorias dos novos instrutores (N:N) ───────────────────────────────
insert into instructor_categories (instructor_id, category_code) values
    ('aaaaaaaa-0000-0000-0000-000000000003', 'B'),
    ('aaaaaaaa-0000-0000-0000-000000000004', 'A'),
    ('aaaaaaaa-0000-0000-0000-000000000004', 'B'),
    ('aaaaaaaa-0000-0000-0000-000000000005', 'B')
on conflict do nothing;

-- ── 4) REFRESH dos horários livres (a correção do "Sem horários") ───────────
-- Apaga os slots 'free' e repovoa com datas frescas para TODOS os instrutores
-- aprovados: dias 10/16/22/28 à frente, nos horários 09h, 14h e 16h (UTC).
-- Todos > 8 dias → sempre visíveis.
-- IMPORTANTE: um slot 'free' PODE estar referenciado por um booking cancelado
-- (recusar uma aula devolve o slot para 'free' mas mantém a linha do booking).
-- Por isso só apagamos os 'free' SEM booking associado, senão a FK estoura.
delete from availability_slots
where status = 'free'
  and id not in (select slot_id from bookings);

insert into availability_slots (instructor_id, start_at, end_at, status)
select
    p.id,
    date_trunc('day', now()) + (d || ' days')::interval + (h || ' hours')::interval,
    date_trunc('day', now()) + (d || ' days')::interval + ((h + 1) || ' hours')::interval,
    'free'
from instructor_profiles p
cross join generate_series(10, 28, 6) as d          -- dias 10, 16, 22, 28
cross join (values (9), (14), (16)) as t(h)         -- 3 horários por dia
where p.status = 'approved';

-- ── 5) Histórico fake: aulas concluídas + avaliações (enriquece os cards) ───
-- Slots 'reserved' no passado (não aparecem na busca) que ancoram aulas já
-- concluídas. avg_rating e total_lessons da view instructor_cards passam a ter
-- valores realistas para Carlos, Beatriz, Rafael e Ana.
insert into availability_slots (id, instructor_id, start_at, end_at, status) values
    ('bbbbbbbb-0000-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000003',
     now() - interval '7 days', now() - interval '7 days' + interval '1 hour', 'reserved'),
    ('bbbbbbbb-0000-0000-0000-000000000011', 'aaaaaaaa-0000-0000-0000-000000000003',
     now() - interval '3 days', now() - interval '3 days' + interval '1 hour', 'reserved'),
    ('bbbbbbbb-0000-0000-0000-000000000012', 'aaaaaaaa-0000-0000-0000-000000000004',
     now() - interval '5 days', now() - interval '5 days' + interval '1 hour', 'reserved'),
    ('bbbbbbbb-0000-0000-0000-000000000013', 'aaaaaaaa-0000-0000-0000-000000000005',
     now() - interval '4 days', now() - interval '4 days' + interval '1 hour', 'reserved'),
    ('bbbbbbbb-0000-0000-0000-000000000014', 'aaaaaaaa-0000-0000-0000-000000000002',
     now() - interval '6 days', now() - interval '6 days' + interval '1 hour', 'reserved')
on conflict do nothing;

insert into bookings
    (id, student_id, slot_id, vehicle_modality, status, price, meeting_address, confirmed_at) values
    ('cccccccc-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111113',
     'bbbbbbbb-0000-0000-0000-000000000010', 'instructor', 'completed', 90.00,
     'Rua Harmonia, 200 - Vila Madalena, São Paulo', now() - interval '7 days'),
    ('cccccccc-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111114',
     'bbbbbbbb-0000-0000-0000-000000000011', 'own', 'completed', 90.00,
     'Rua Harmonia, 200 - Vila Madalena, São Paulo', now() - interval '3 days'),
    ('cccccccc-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111113',
     'bbbbbbbb-0000-0000-0000-000000000012', 'instructor', 'completed', 150.00,
     'Rua Harmonia, 200 - Vila Madalena, São Paulo', now() - interval '5 days'),
    ('cccccccc-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111112',
     'bbbbbbbb-0000-0000-0000-000000000013', 'instructor', 'completed', 110.00,
     'Av. Paulista, 1500 - Bela Vista, São Paulo', now() - interval '4 days'),
    ('cccccccc-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111',
     'bbbbbbbb-0000-0000-0000-000000000014', 'instructor', 'completed', 100.00,
     'Rua das Acácias, 100 - Pinheiros, São Paulo', now() - interval '6 days')
on conflict do nothing;

-- Avaliações do aluno (rater_role='student' alimenta o avg_rating da view)
insert into ratings (booking_id, rater_role, stars) values
    ('cccccccc-0000-0000-0000-000000000010', 'student', 5),
    ('cccccccc-0000-0000-0000-000000000011', 'student', 4),
    ('cccccccc-0000-0000-0000-000000000012', 'student', 5),
    ('cccccccc-0000-0000-0000-000000000013', 'student', 4),
    ('cccccccc-0000-0000-0000-000000000014', 'student', 5)
on conflict do nothing;

-- Relatórios de aula (REQ08) p/ alimentar a IA/dashboard (REQ05) de Carlos e Ana
insert into lesson_reports
    (booking_id, baliza, percurso, embreagem, observations, strengths, weaknesses) values
    ('cccccccc-0000-0000-0000-000000000010', 6, 8, 7,
     'Boa noção de espaço; baliza ainda precisa de prática.',
     'Percurso urbano confiante', 'Baliza em vaga curta'),
    ('cccccccc-0000-0000-0000-000000000014', 7, 7, 8,
     'Aluno consistente, pronto para simular a prova.',
     'Controle de embreagem', 'Atenção a placas de prioridade')
on conflict do nothing;

-- ── Conferência rápida (opcional): horários visíveis por instrutor ──────────
-- select u.full_name, count(*) filter (where s.status='free'
--          and s.start_at >= now() + interval '8 days') as slots_visiveis
-- from instructor_profiles p join users u on u.id = p.user_id
-- left join availability_slots s on s.instructor_id = p.id
-- where p.status='approved' group by u.full_name order by u.full_name;
