"""
app/repositories/supabase_client.py

Configuração do cliente Supabase.
Usa SERVICE_ROLE_KEY (bypassa RLS) — toda filtragem de segurança é feita no código.
"""

from supabase import Client, create_client

from app.core.config import settings


def get_supabase_client() -> Client:
    """Cria e retorna uma instância do cliente Supabase."""
    return create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY,
    )


# Instância singleton para uso nos repositories.
supabase: Client = get_supabase_client()
