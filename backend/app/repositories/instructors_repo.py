"""
app/repositories/instructors_repo.py

Acesso a instructor_profiles, instructor_categories e à view instructor_cards.
"""

from app.repositories.supabase_client import supabase


def get_profile_by_user(user_id: str) -> dict | None:
    res = (
        supabase.table("instructor_profiles")
        .select("*")
        .eq("user_id", str(user_id))
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def get_profile(profile_id: str) -> dict | None:
    res = (
        supabase.table("instructor_profiles")
        .select("*")
        .eq("id", str(profile_id))
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def insert_profile(data: dict) -> dict:
    res = supabase.table("instructor_profiles").insert(data).execute()
    return res.data[0]


def update_profile(profile_id: str, data: dict) -> dict | None:
    res = (
        supabase.table("instructor_profiles")
        .update(data)
        .eq("id", str(profile_id))
        .execute()
    )
    return res.data[0] if res.data else None


def set_categories(profile_id: str, categories: list[str]) -> None:
    supabase.table("instructor_categories").delete().eq(
        "instructor_id", str(profile_id)
    ).execute()
    rows = [{"instructor_id": str(profile_id), "category_code": c} for c in categories]
    if rows:
        supabase.table("instructor_categories").insert(rows).execute()


def get_categories(profile_id: str) -> list[str]:
    res = (
        supabase.table("instructor_categories")
        .select("category_code")
        .eq("instructor_id", str(profile_id))
        .execute()
    )
    return [r["category_code"] for r in res.data]


def search_cards(
    category: str | None = None,
    region: str | None = None,
    needs_instructor_vehicle: bool | None = None,
) -> list[dict]:
    """Busca na view instructor_cards, só perfis aprovados (REQ03)."""
    query = supabase.table("instructor_cards").select("*").eq("status", "approved")
    if region:
        query = query.ilike("region", f"%{region}%")
    if needs_instructor_vehicle:
        query = query.eq("provides_vehicle", True)
    if category:
        query = query.contains("categories", [category])
    return query.execute().data


def get_card(instructor_id: str) -> dict | None:
    res = (
        supabase.table("instructor_cards")
        .select("*")
        .eq("instructor_id", str(instructor_id))
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None
