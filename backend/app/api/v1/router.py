"""
app/api/v1/router.py

Agregador de rotas da API v1. Todos os routers de domínio são incluídos aqui.
"""

from fastapi import APIRouter

from app.api.v1 import auth, bookings, chat, instructors, payments, reports, users
from app.api.v1.health import router as health_router

v1_router = APIRouter(prefix="/api/v1")

# ── Rotas ────────────────────────────────────────────────────
v1_router.include_router(health_router)
v1_router.include_router(auth.router)
v1_router.include_router(users.router)
v1_router.include_router(instructors.router)
v1_router.include_router(bookings.router)
v1_router.include_router(reports.router)
v1_router.include_router(chat.router)
v1_router.include_router(payments.router)
