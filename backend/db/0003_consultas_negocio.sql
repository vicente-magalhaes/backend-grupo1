-- ============================================================================
-- CNH Connect — Consultas de negócio (roteiro_final §8.3)
-- 3 consultas com SELECT + JOIN + GROUP BY que extraem inteligência do sistema.
-- Justificadas pela 3FN: como NÃO armazenamos campos calculados (nota média,
-- nº de aulas, médias de competência), eles são derivados aqui em tempo real.
-- ============================================================================

-- Q1 — Ranking de instrutores: nota média (avaliações dos alunos) e nº de aulas.
-- Alimenta os filtros secundários do REQ03 (ordenar por nota / aulas concluídas).
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

-- Q2 — Dashboard de evolução do aluno: médias das 3 competências (REQ05/REQ08).
SELECT u.full_name AS aluno,
       ROUND(AVG(lr.baliza), 1)    AS media_baliza,
       ROUND(AVG(lr.percurso), 1)  AS media_percurso,
       ROUND(AVG(lr.embreagem), 1) AS media_embreagem,
       COUNT(*) AS aulas_avaliadas
FROM lesson_reports lr
JOIN bookings b ON b.id = lr.booking_id
JOIN users u    ON u.id = b.student_id
GROUP BY u.id, u.full_name;

-- Q3 — Volume de aulas confirmadas por região (visão operacional/admin).
SELECT ip.region, COUNT(*) AS aulas_confirmadas
FROM bookings b
JOIN availability_slots s   ON s.id = b.slot_id
JOIN instructor_profiles ip ON ip.id = s.instructor_id
WHERE b.status = 'confirmed'
GROUP BY ip.region
ORDER BY aulas_confirmadas DESC;
