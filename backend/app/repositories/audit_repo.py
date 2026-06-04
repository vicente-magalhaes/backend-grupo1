"""
app/repositories/audit_repo.py

Acesso à tabela audit_logs (trilha de auditoria — REQNF02).
"""

from app.repositories.supabase_client import supabase


def insert_audit(
    actor_user_id: str | None, action: str, entity: str, entity_id: str | None = None
) -> None:
    supabase.table("audit_logs").insert(
        {
            "actor_user_id": str(actor_user_id) if actor_user_id else None,
            "action": action,
            "entity": entity,
            "entity_id": str(entity_id) if entity_id else None,
        }
    ).execute()
