"""
app/core/audit.py

Helper de auditoria/observabilidade. Registra eventos na tabela audit_logs e em
log estruturado — SEMPRE referenciando apenas IDs, nunca dados sensíveis (skill 30).
A auditoria nunca deve interromper o fluxo principal de negócio.
"""

import logging

from app.repositories import audit_repo

logger = logging.getLogger("cnh.audit")


def log_event(
    actor_user_id: str | None, action: str, entity: str, entity_id: str | None = None
) -> None:
    try:
        audit_repo.insert_audit(actor_user_id, action, entity, entity_id)
    except Exception:  # noqa: BLE001 — auditoria é best-effort
        logger.exception("Falha ao gravar audit_log (action=%s entity=%s)", action, entity)
    logger.info(
        "audit action=%s entity=%s entity_id=%s actor=%s",
        action,
        entity,
        entity_id,
        actor_user_id,
    )
