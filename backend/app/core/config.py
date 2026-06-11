"""
app/core/config.py

Configurações centrais do projeto CNH Connect.
Usa pydantic-settings para carregar variáveis de ambiente de forma tipada e segura.
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações globais carregadas a partir de variáveis de ambiente ou arquivo .env."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Supabase ─────────────────────────────────────────────
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    @field_validator("SUPABASE_URL")
    @classmethod
    def _normalize_supabase_url(cls, v: str) -> str:
        """Aceita a URL base do projeto, mesmo se colada com '/' final ou '/rest/v1'."""
        v = v.strip().rstrip("/")
        if v.endswith("/rest/v1"):
            v = v[: -len("/rest/v1")]
        return v

    # ── Segurança / JWT ──────────────────────────────────────
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    # 8h: confortável para uma sessão de dev/demo sem re-login no meio.
    # Em produção real um valor curto (ex.: 60) + refresh token seria o ideal.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # ── Aplicação ────────────────────────────────────────────
    APP_NAME: str = "CNH Connect"
    DEBUG: bool = False


# Instância singleton — importe `settings` onde precisar.
settings = Settings()
