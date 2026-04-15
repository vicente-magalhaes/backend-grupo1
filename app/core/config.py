"""
app/core/config.py

Configurações centrais do projeto CNH Connect.
Usa pydantic-settings para carregar variáveis de ambiente de forma tipada e segura.
"""

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

    # ── Segurança / JWT ──────────────────────────────────────
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── Aplicação ────────────────────────────────────────────
    APP_NAME: str = "CNH Connect"
    DEBUG: bool = False


# Instância singleton — importe `settings` onde precisar.
settings = Settings()
