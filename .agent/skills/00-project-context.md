# Projeto: CNH Connect
- Produto: Marketplace que conecta Alunos e Instrutores para aulas práticas.
- MVP Ciclo 2: O pagamento financeiro real está fora do escopo ou será apenas simulado (status interno).
- Entidades principais: User (student|instructor|admin), InstructorProfile, AvailabilitySlot, Booking, LessonReport.
- Regras críticas:
  - Privacidade: Endereço exato do aluno SÓ é revelado ao instrutor após o agendamento (booking) ser CONFIRMADO.
  - IA: No ciclo 2, operamos com heurísticas simples para alocação inteligente.
