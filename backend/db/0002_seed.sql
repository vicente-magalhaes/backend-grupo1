-- ============================================================================
-- CNH Connect — Seed 0002 (dados de demonstração)
-- Rode DEPOIS de 0001_init.sql. Senha de todos os usuários: senha123
-- (hash bcrypt embutido abaixo). UUIDs fixos para facilitar as relações.
-- ============================================================================

-- Categorias (lookup)
insert into categories (code, description) values
    ('A', 'Motocicletas'),
    ('B', 'Automóveis');

-- Usuários (senha123)
-- hash: $2b$12$LzNceMwIJB.Edz.ka0WK8.M1UE.B14lyAWi9aFRYX.YnieP/Hq2TO
insert into users (id, role, full_name, email, phone, cpf, password_hash, meeting_address) values
    ('11111111-1111-1111-1111-111111111111', 'student', 'Vicente Magalhães',
     'vicente@aluno.com', '11999990001', '11111111111',
     '$2b$12$LzNceMwIJB.Edz.ka0WK8.M1UE.B14lyAWi9aFRYX.YnieP/Hq2TO',
     'Rua das Acácias, 100 - Pinheiros, São Paulo'),
    ('11111111-1111-1111-1111-111111111112', 'student', 'Maria Souza',
     'maria@aluno.com', '11999990002', '22222222222',
     '$2b$12$LzNceMwIJB.Edz.ka0WK8.M1UE.B14lyAWi9aFRYX.YnieP/Hq2TO',
     'Av. Paulista, 1500 - Bela Vista, São Paulo'),
    ('22222222-2222-2222-2222-222222222221', 'instructor', 'João Pereira',
     'joao@instrutor.com', '11988880001', '33333333333',
     '$2b$12$LzNceMwIJB.Edz.ka0WK8.M1UE.B14lyAWi9aFRYX.YnieP/Hq2TO', null),
    ('22222222-2222-2222-2222-222222222222', 'instructor', 'Ana Lima',
     'ana@instrutor.com', '11988880002', '44444444444',
     '$2b$12$LzNceMwIJB.Edz.ka0WK8.M1UE.B14lyAWi9aFRYX.YnieP/Hq2TO', null),
    ('33333333-3333-3333-3333-333333333331', 'admin', 'Equipe CNH Connect',
     'admin@cnhconnect.com', '11977770001', '55555555555',
     '$2b$12$LzNceMwIJB.Edz.ka0WK8.M1UE.B14lyAWi9aFRYX.YnieP/Hq2TO', null);

-- Perfis de instrutor (aprovados)
insert into instructor_profiles
    (id, user_id, status, provides_vehicle, cnh_url, credential_url, crlv_url,
     vehicle_photo_url, teaching_method, price, region) values
    ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222221',
     'approved', true, 'docs/joao/cnh.pdf', 'docs/joao/credencial.pdf',
     'docs/joao/crlv.pdf', 'docs/joao/veiculo.jpg',
     'Foco em baliza e direção defensiva. Paciência com iniciantes.', 120.00, 'Pinheiros'),
    ('aaaaaaaa-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
     'approved', false, 'docs/ana/cnh.pdf', 'docs/ana/credencial.pdf',
     null, null, 'Especialista em percurso urbano e provas do Detran-SP.', 100.00, 'Vila Mariana');

-- Categorias dos instrutores (N:N)
insert into instructor_categories (instructor_id, category_code) values
    ('aaaaaaaa-0000-0000-0000-000000000001', 'A'),
    ('aaaaaaaa-0000-0000-0000-000000000001', 'B'),
    ('aaaaaaaa-0000-0000-0000-000000000002', 'B');

-- Horários disponíveis (futuros — respeitam a regra dos 8 dias do REQ03).
-- ATENÇÃO: o now() é avaliado quando este seed roda e fica FIXO. Slots muito
-- próximos do limite de 8 dias "vencem" com o passar do tempo (param < 192h e
-- somem da busca). Por isso usamos folga grande (15–22 dias). Para repovoar com
-- datas sempre frescas em uma demo, rode 0005_seed_extra.sql.
insert into availability_slots (id, instructor_id, start_at, end_at, status) values
    ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
     now() + interval '10 days', now() + interval '10 days 1 hour', 'reserved'),
    ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
     now() + interval '15 days', now() + interval '15 days 1 hour', 'free'),
    ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002',
     now() + interval '18 days', now() + interval '18 days 1 hour', 'free');

-- Uma aula já confirmada (Vicente com João) para alimentar relatórios/IA
insert into bookings
    (id, student_id, slot_id, vehicle_modality, status, price, meeting_address, confirmed_at) values
    ('cccccccc-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'bbbbbbbb-0000-0000-0000-000000000001', 'instructor', 'confirmed', 120.00,
     'Rua das Acácias, 100 - Pinheiros, São Paulo', now());

-- Relatório da aula confirmada (REQ08)
insert into lesson_reports
    (booking_id, baliza, percurso, embreagem, observations, strengths, weaknesses) values
    ('cccccccc-0000-0000-0000-000000000001', 4, 7, 6,
     'Boa evolução no percurso; precisa praticar baliza.',
     'Percurso urbano, atenção às placas', 'Baliza, controle de embreagem em subida');

-- Avaliações mútuas (REQ06)
insert into ratings (booking_id, rater_role, stars) values
    ('cccccccc-0000-0000-0000-000000000001', 'student', 5),
    ('cccccccc-0000-0000-0000-000000000001', 'instructor', 4);

-- Pagamento simulado (REQ09)
insert into payments (booking_id, amount, method, status) values
    ('cccccccc-0000-0000-0000-000000000001', 120.00, 'pix', 'paid');

-- Algumas mensagens de chat (REQ06)
insert into chat_messages (booking_id, sender_id, content, msg_type) values
    ('cccccccc-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
     'Olá João, confirmo a aula!', 'text'),
    ('cccccccc-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222221',
     'Perfeito, Vicente. Nos vemos lá.', 'text');

-- Notificações de exemplo
insert into notifications (user_id, type, message) values
    ('11111111-1111-1111-1111-111111111111', 'booking_confirmed',
     'Sua aula com João Pereira foi confirmada.'),
    ('22222222-2222-2222-2222-222222222221', 'payment_received',
     'Pagamento da aula de Vicente Magalhães recebido.');
