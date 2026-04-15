# SKILL: Segurança e LGPD (REQNF02)
- CPF, CNH, CRLV e endereços são dados sensíveis. NUNCA faça log (print) desses valores completos.
- Logs do sistema devem registrar apenas os eventos atrelados aos IDs (`user_id`, `booking_id`).
- Storage de Documentos: CNH e CRLV devem ficar em buckets privados no Supabase. O backend deve gerar URLs assinadas com tempo de expiração curto para acesso temporário.
