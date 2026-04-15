"""
app/core/handlers.py

Exception handlers globais que convertem exceções de domínio em respostas HTTP.
Registrados no app FastAPI via main.py.
"""

from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.errors import ConflictError, ForbiddenError, NotFoundError


async def not_found_handler(_request: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": exc.detail})


async def conflict_handler(_request: Request, exc: ConflictError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": exc.detail})


async def forbidden_handler(_request: Request, exc: ForbiddenError) -> JSONResponse:
    return JSONResponse(status_code=403, content={"detail": exc.detail})
