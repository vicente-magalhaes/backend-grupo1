# SKILL: Supabase (supabase-py)
- Todo acesso ao Supabase fica restrito à camada `app/repositories/`.
- Todas as queries OBRIGATORIAMENTE terminam com `.execute()`.
- Dados devem ser acessados via `response.data`.
- UUIDs devem ser sempre convertidos para string (`str(uuid_var)`).
- Segurança Crítica:
  - Como o backend usa a `SERVICE_ROLE_KEY`, o RLS (Row Level Security) do banco é ignorado.
  - Portanto, TODA query de dados privados DEVE ser filtrada no código por ID (`student_id` ou `instructor_id`).
  - Proibido criar endpoints que retornem listas globais de dados sensíveis sem filtro de usuário.
