-- ============================================================================
-- CNH Connect — Views 0004 (leituras agregadas)
-- Views são CALCULADAS, não armazenam dados → não ferem a 3FN. Concentram a
-- lógica de agregação (nota média, nº de aulas) reaproveitada pelo backend.
-- Rode DEPOIS de 0001_init.sql.
-- ============================================================================

-- Card do instrutor para a busca (REQ03): junta nome, categorias (agregadas),
-- nota média (avaliações dos alunos) e total de aulas confirmadas/concluídas.
create or replace view instructor_cards as
select
    ip.id               as instructor_id,
    u.full_name,
    ip.region,
    ip.price,
    ip.provides_vehicle,
    ip.status,
    ip.teaching_method,
    coalesce(
        array_agg(distinct ic.category_code) filter (where ic.category_code is not null),
        '{}'
    )                   as categories,
    round(avg(r.stars) filter (where r.rater_role = 'student'), 2) as avg_rating,
    count(distinct b.id) filter (where b.status in ('confirmed', 'completed')) as total_lessons
from instructor_profiles ip
join users u                     on u.id = ip.user_id
left join instructor_categories ic on ic.instructor_id = ip.id
left join availability_slots s   on s.instructor_id = ip.id
left join bookings b             on b.slot_id = s.id
left join ratings r              on r.booking_id = b.id
group by ip.id, u.full_name, ip.region, ip.price, ip.provides_vehicle,
         ip.status, ip.teaching_method;
