"""
app/schemas/user.py

Schemas de leitura/edição de perfil de usuário (REQ01 — "meu perfil").
"""

from pydantic import BaseModel


class UserOut(BaseModel):
    id: str
    role: str
    full_name: str
    email: str
    phone: str
    cpf: str
    meeting_address: str | None = None
    created_at: str | None = None


class UserUpdate(BaseModel):
    """Edição de perfil. Todos opcionais — só o que vier é alterado."""

    full_name: str | None = None
    phone: str | None = None
    meeting_address: str | None = None
    password: str | None = None


class NotificationOut(BaseModel):
    id: str
    type: str
    message: str
    read: bool
    created_at: str | None = None
