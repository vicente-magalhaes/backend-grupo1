"""
app/main.py

Ponto de entrada do FastAPI — CNH Connect.
Responsável apenas por: inicializar o app, plugar middlewares, routers e exception handlers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import v1_router
from app.core.config import settings
from app.core.errors import ConflictError, ForbiddenError, NotFoundError
from app.core.handlers import conflict_handler, forbidden_handler, not_found_handler

app = FastAPI(
    title=settings.APP_NAME,
    description="Marketplace que conecta Alunos e Instrutores para aulas práticas de direção.",
    version="0.1.0",
    debug=settings.DEBUG,
)

# ── Middlewares ───────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restringir em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception Handlers Globais ────────────────────────────────
app.add_exception_handler(NotFoundError, not_found_handler)
app.add_exception_handler(ConflictError, conflict_handler)
app.add_exception_handler(ForbiddenError, forbidden_handler)

# ── Routers ───────────────────────────────────────────────────
app.include_router(v1_router)
