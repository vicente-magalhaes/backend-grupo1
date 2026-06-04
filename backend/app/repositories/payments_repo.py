"""
app/repositories/payments_repo.py

Acesso a payments (REQ09) e notifications.
"""

from app.repositories.supabase_client import supabase


# ── payments ────────────────────────────────────────────────────────────────
def insert_payment(data: dict) -> dict:
    res = supabase.table("payments").insert(data).execute()
    return res.data[0]


def get_by_booking(booking_id: str) -> dict | None:
    res = (
        supabase.table("payments")
        .select("*")
        .eq("booking_id", str(booking_id))
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def update_payment(payment_id: str, data: dict) -> dict | None:
    res = supabase.table("payments").update(data).eq("id", str(payment_id)).execute()
    return res.data[0] if res.data else None


# ── notifications ───────────────────────────────────────────────────────────
def insert_notification(data: dict) -> dict:
    res = supabase.table("notifications").insert(data).execute()
    return res.data[0]


def list_notifications(user_id: str) -> list[dict]:
    return (
        supabase.table("notifications")
        .select("*")
        .eq("user_id", str(user_id))
        .order("created_at", desc=True)
        .execute()
        .data
    )
