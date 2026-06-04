"""
app/repositories/bookings_repo.py

Acesso a availability_slots e bookings.
O instrutor de um booking é obtido via slot (3FN — sem coluna redundante).
"""

from app.repositories.supabase_client import supabase


# ── availability_slots ──────────────────────────────────────────────────────
def insert_slot(data: dict) -> dict:
    res = supabase.table("availability_slots").insert(data).execute()
    return res.data[0]


def get_slot(slot_id: str) -> dict | None:
    res = (
        supabase.table("availability_slots")
        .select("*")
        .eq("id", str(slot_id))
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def list_slots(instructor_id: str, only_free: bool = False) -> list[dict]:
    query = (
        supabase.table("availability_slots")
        .select("*")
        .eq("instructor_id", str(instructor_id))
    )
    if only_free:
        query = query.eq("status", "free")
    return query.order("start_at").execute().data


def update_slot_status(slot_id: str, status: str) -> dict | None:
    res = (
        supabase.table("availability_slots")
        .update({"status": status})
        .eq("id", str(slot_id))
        .execute()
    )
    return res.data[0] if res.data else None


# ── bookings ────────────────────────────────────────────────────────────────
def insert_booking(data: dict) -> dict:
    res = supabase.table("bookings").insert(data).execute()
    return res.data[0]


def get_booking(booking_id: str) -> dict | None:
    res = (
        supabase.table("bookings").select("*").eq("id", str(booking_id)).limit(1).execute()
    )
    return res.data[0] if res.data else None


def list_by_student(student_id: str) -> list[dict]:
    return (
        supabase.table("bookings")
        .select("*")
        .eq("student_id", str(student_id))
        .order("created_at", desc=True)
        .execute()
        .data
    )


def list_by_instructor(instructor_id: str) -> list[dict]:
    """Bookings do instrutor: resolve via slots (booking → slot → instructor)."""
    slots = (
        supabase.table("availability_slots")
        .select("id")
        .eq("instructor_id", str(instructor_id))
        .execute()
        .data
    )
    slot_ids = [s["id"] for s in slots]
    if not slot_ids:
        return []
    return (
        supabase.table("bookings")
        .select("*")
        .in_("slot_id", slot_ids)
        .order("created_at", desc=True)
        .execute()
        .data
    )


def update_booking(booking_id: str, data: dict) -> dict | None:
    res = (
        supabase.table("bookings").update(data).eq("id", str(booking_id)).execute()
    )
    return res.data[0] if res.data else None
