"""
app/api/v1/auth.py — rotas de cadastro e login (REQ01).
"""

from fastapi import APIRouter

from app.schemas.auth import LoginRequest, StudentRegister, TokenResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: StudentRegister):
    return auth_service.register_student(payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    return auth_service.login(payload)
