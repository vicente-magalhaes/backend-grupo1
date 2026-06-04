"""
app/services/user_service.py

Visualização e edição de perfil (REQ01 — "meu perfil").
"""

from app.core import audit
from app.core.errors import NotFoundError
from app.core.security import hash_password
from app.repositories import payments_repo, users_repo
from app.schemas.user import NotificationOut, UserOut, UserUpdate


def _to_out(user: dict) -> UserOut:
    return UserOut(
        id=str(user["id"]),
        role=user["role"],
        full_name=user["full_name"],
        email=user["email"],
        phone=user["phone"],
        cpf=user["cpf"],
        meeting_address=user.get("meeting_address"),
        created_at=str(user.get("created_at")) if user.get("created_at") else None,
    )


def get_profile(user_id: str) -> UserOut:
    user = users_repo.get_by_id(user_id)
    if not user:
        raise NotFoundError("Usuário não encontrado")
    return _to_out(user)


def update_profile(user_id: str, payload: UserUpdate) -> UserOut:
    user = users_repo.get_by_id(user_id)
    if not user:
        raise NotFoundError("Usuário não encontrado")

    changes: dict = {}
    if payload.full_name is not None:
        changes["full_name"] = payload.full_name
    if payload.phone is not None:
        changes["phone"] = payload.phone
    if payload.meeting_address is not None:
        changes["meeting_address"] = payload.meeting_address
    if payload.password is not None:
        changes["password_hash"] = hash_password(payload.password)

    if changes:
        user = users_repo.update(user_id, changes)
        audit.log_event(user_id, "update_profile", "users", user_id)
    return _to_out(user)


def list_notifications(user_id: str) -> list[NotificationOut]:
    rows = payments_repo.list_notifications(user_id)
    return [
        NotificationOut(
            id=str(n["id"]),
            type=n["type"],
            message=n["message"],
            read=n["read"],
            created_at=str(n.get("created_at")) if n.get("created_at") else None,
        )
        for n in rows
    ]
