"""
app/core/errors.py

Exceções de domínio do CNH Connect.
Services lançam estas exceções; o handler global em handlers.py as converte em HTTP responses.
"""


class DomainError(Exception):
    """Classe base para todas as exceções de domínio."""

    def __init__(self, detail: str = "Erro interno de domínio"):
        self.detail = detail
        super().__init__(self.detail)


class NotFoundError(DomainError):
    """Recurso não encontrado (mapeia para HTTP 404)."""

    def __init__(self, detail: str = "Recurso não encontrado"):
        super().__init__(detail)


class ConflictError(DomainError):
    """Conflito de estado ou duplicidade (mapeia para HTTP 409)."""

    def __init__(
        self, detail: str = "Conflito: o recurso já existe ou está em estado inconsistente"
    ):
        super().__init__(detail)


class ForbiddenError(DomainError):
    """Acesso negado — autenticado, mas sem permissão (mapeia para HTTP 403)."""

    def __init__(self, detail: str = "Acesso negado"):
        super().__init__(detail)


class UnauthorizedError(DomainError):
    """Falha de autenticação — token ausente/ inválido (mapeia para HTTP 401)."""

    def __init__(self, detail: str = "Não autenticado"):
        super().__init__(detail)


class BadRequestError(DomainError):
    """Entrada inválida segundo as regras de negócio (mapeia para HTTP 400)."""

    def __init__(self, detail: str = "Requisição inválida"):
        super().__init__(detail)
