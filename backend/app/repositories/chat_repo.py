"""
app/repositories/chat_repo.py

Acesso a chat_messages (REQ06) e ratings (avaliação 5 estrelas — REQ06).
"""

from app.repositories.supabase_client import supabase


# ── chat_messages ───────────────────────────────────────────────────────────
def insert_message(data: dict) -> dict:
    res = supabase.table("chat_messages").insert(data).execute()
    return res.data[0]


def list_messages(booking_id: str) -> list[dict]:
    return (
        supabase.table("chat_messages")
        .select("*")
        .eq("booking_id", str(booking_id))
        .order("created_at")
        .execute()
        .data
    )


# ── ratings ─────────────────────────────────────────────────────────────────
def insert_rating(data: dict) -> dict:
    res = supabase.table("ratings").insert(data).execute()
    return res.data[0]


def get_rating(booking_id: str, rater_role: str) -> dict | None:
    res = (
        supabase.table("ratings")
        .select("*")
        .eq("booking_id", str(booking_id))
        .eq("rater_role", rater_role)
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None
