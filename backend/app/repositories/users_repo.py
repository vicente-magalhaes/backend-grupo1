"""
app/repositories/users_repo.py

Acesso à tabela users. Toda query termina com .execute(); dados via .data (skill 20).
"""

from app.repositories.supabase_client import supabase

TABLE = "users"


def get_by_id(user_id: str) -> dict | None:
    res = supabase.table(TABLE).select("*").eq("id", str(user_id)).limit(1).execute()
    return res.data[0] if res.data else None


def get_by_email(email: str) -> dict | None:
    res = supabase.table(TABLE).select("*").eq("email", email.lower()).limit(1).execute()
    return res.data[0] if res.data else None


def get_by_cpf(cpf: str) -> dict | None:
    res = supabase.table(TABLE).select("*").eq("cpf", cpf).limit(1).execute()
    return res.data[0] if res.data else None


def insert(data: dict) -> dict:
    res = supabase.table(TABLE).insert(data).execute()
    return res.data[0]


def update(user_id: str, data: dict) -> dict | None:
    res = supabase.table(TABLE).update(data).eq("id", str(user_id)).execute()
    return res.data[0] if res.data else None
