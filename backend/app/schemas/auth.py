"""
app/schemas/auth.py

Schemas de autenticação e cadastro (REQ01).
"""

import re

from pydantic import BaseModel, field_validator

_CPF_RE = re.compile(r"^\d{11}$")
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class StudentRegister(BaseModel):
    """Cadastro de aluno (REQ01) — todos os campos obrigatórios."""

    full_name: str
    email: str
    phone: str
    cpf: str
    password: str
    meeting_address: str

    @field_validator("cpf")
    @classmethod
    def _validate_cpf(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if not _CPF_RE.match(digits):
            raise ValueError("CPF deve conter 11 dígitos")
        return digits

    @field_validator("email")
    @classmethod
    def _validate_email(cls, v: str) -> str:
        if not _EMAIL_RE.match(v):
            raise ValueError("E-mail em formato inválido")
        return v.lower()

    @field_validator("password")
    @classmethod
    def _validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Senha deve ter ao menos 6 caracteres")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
