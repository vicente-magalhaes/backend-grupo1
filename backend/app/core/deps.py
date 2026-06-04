"""
app/core/deps.py

Dependências de segurança do FastAPI: extrai e valida o JWT do header Authorization
e disponibiliza o usuário atual para as rotas protegidas.
"""

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.errors import ForbiddenError, UnauthorizedError
from app.core.security import decode_access_token

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    """Valida o token e retorna {'id', 'role'} do usuário autenticado."""
    if credentials is None:
        raise UnauthorizedError("Token de autenticação ausente")
    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError as exc:
        raise UnauthorizedError("Token inválido ou expirado") from exc
    return {"id": payload["sub"], "role": payload["role"]}


def require_role(*roles: str):
    """Factory de dependency que exige que o usuário tenha um dos papéis dados."""

    def _checker(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in roles:
            raise ForbiddenError(
                f"Ação permitida apenas para: {', '.join(roles)}"
            )
        return user

    return _checker
