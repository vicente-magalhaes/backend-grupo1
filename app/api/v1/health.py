"""
app/api/v1/health.py

Endpoint de health check — verifica se o servidor está operacional.
"""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Retorna o status de saúde da API."""
    return {"status": "ok", "service": "CNH Connect API"}
