"""
app/services/auth_service.py

Regras de cadastro e login (REQ01). Não importa FastAPI.
"""

from app.core import audit
from app.core.errors import ConflictError, UnauthorizedError
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories import users_repo
from app.schemas.auth import LoginRequest, StudentRegister, TokenResponse


def register_student(payload: StudentRegister) -> TokenResponse:
    # REQ01: não permitir e-mail ou CPF já cadastrados
    if users_repo.get_by_email(payload.email):
        raise ConflictError("Já existe uma conta com este e-mail")
    if users_repo.get_by_cpf(payload.cpf):
        raise ConflictError("Já existe uma conta com este CPF")

    user = users_repo.insert(
        {
            "role": "student",
            "full_name": payload.full_name,
            "email": payload.email,
            "phone": payload.phone,
            "cpf": payload.cpf,
            "password_hash": hash_password(payload.password),
            "meeting_address": payload.meeting_address,
        }
    )
    audit.log_event(user["id"], "register_student", "users", user["id"])
    token = create_access_token(user["id"], user["role"])
    return TokenResponse(access_token=token, user_id=user["id"], role=user["role"])


def login(payload: LoginRequest) -> TokenResponse:
    user = users_repo.get_by_email(payload.email)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise UnauthorizedError("E-mail ou senha incorretos")
    audit.log_event(user["id"], "login", "users", user["id"])
    token = create_access_token(user["id"], user["role"])
    return TokenResponse(access_token=token, user_id=user["id"], role=user["role"])
