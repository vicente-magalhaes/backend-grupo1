"""
app/repositories/supabase_client.py

Cliente Supabase (SERVICE_ROLE_KEY — bypassa RLS; filtragem de segurança é feita no código).

O cliente é criado de forma PREGUIÇOSA (lazy), só no primeiro acesso real ao banco.
Isso permite importar o app sem credenciais válidas (testes/CI) e evita acoplamento:
nada de conexão no import. Os repositories continuam usando `supabase.table(...)`.
"""

from supabase import Client, create_client

from app.core.config import settings

_client: Client | None = None


def get_supabase_client() -> Client:
    """Cria (uma vez) e retorna a instância singleton do cliente Supabase."""
    global _client
    if _client is None:
        _client = create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _client


class _LazySupabase:
    """Proxy que encaminha tudo para o cliente real, criado só no primeiro uso."""

    def __getattr__(self, name: str):
        return getattr(get_supabase_client(), name)


# Importável pelos repositories sem disparar a criação do cliente no import.
supabase = _LazySupabase()
