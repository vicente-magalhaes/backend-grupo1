"""
app/repositories/reports_repo.py

Acesso à tabela lesson_reports (REQ08).
"""

from app.repositories.supabase_client import supabase


def insert_report(data: dict) -> dict:
    res = supabase.table("lesson_reports").insert(data).execute()
    return res.data[0]


def get_by_booking(booking_id: str) -> dict | None:
    res = (
        supabase.table("lesson_reports")
        .select("*")
        .eq("booking_id", str(booking_id))
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def list_by_bookings(booking_ids: list[str]) -> list[dict]:
    if not booking_ids:
        return []
    return (
        supabase.table("lesson_reports")
        .select("*")
        .in_("booking_id", booking_ids)
        .order("created_at")
        .execute()
        .data
    )
