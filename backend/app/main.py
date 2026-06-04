"""
app/main.py

Ponto de entrada do FastAPI — CNH Connect.
Responsável apenas por: inicializar o app, plugar middlewares, routers e exception handlers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import v1_router
from app.core.config import settings
from app.core.errors import (
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
)
from app.core.handlers import (
    bad_request_handler,
    conflict_handler,
    forbidden_handler,
    not_found_handler,
    unauthorized_handler,
)

app = FastAPI(
    title=settings.APP_NAME,
    description="Marketplace que conecta Alunos e Instrutores para aulas práticas de direção.",
    version="0.1.0",
    debug=settings.DEBUG,
)

# ── Middlewares ───────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # App mobile (Expo) consome de origens variáveis; restringir em produção.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception Handlers Globais ────────────────────────────────
app.add_exception_handler(NotFoundError, not_found_handler)
app.add_exception_handler(ConflictError, conflict_handler)
app.add_exception_handler(ForbiddenError, forbidden_handler)
app.add_exception_handler(UnauthorizedError, unauthorized_handler)
app.add_exception_handler(BadRequestError, bad_request_handler)

# ── Routers ───────────────────────────────────────────────────
app.include_router(v1_router)
