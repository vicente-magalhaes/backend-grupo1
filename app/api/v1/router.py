"""
app/api/v1/router.py

Agregador de rotas da API v1.
Todos os routers de domínio devem ser incluídos aqui.
"""

from fastapi import APIRouter

from app.api.v1.health import router as health_router

v1_router = APIRouter(prefix="/api/v1")

# ── Rotas ────────────────────────────────────────────────────
v1_router.include_router(health_router)
