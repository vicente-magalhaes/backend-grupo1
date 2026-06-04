"""
app/services/instructor_service.py

Solicitação e gestão de perfil de instrutor (REQ02) e busca de instrutores (REQ03).
"""

from app.core import audit
from app.core.errors import BadRequestError, ConflictError, ForbiddenError, NotFoundError
from app.repositories import instructors_repo, users_repo
from app.schemas.instructor import (
    InstructorCard,
    InstructorProfileOut,
    InstructorRequest,
    InstructorUpdate,
)


def _card_from_row(row: dict) -> InstructorCard:
    return InstructorCard(
        instructor_id=str(row["instructor_id"]),
        full_name=row["full_name"],
        region=row["region"],
        price=float(row["price"]),
        provides_vehicle=row["provides_vehicle"],
        categories=row.get("categories") or [],
        avg_rating=float(row["avg_rating"]) if row.get("avg_rating") is not None else None,
        total_lessons=row.get("total_lessons") or 0,
    )


def request_instructor(user_id: str, payload: InstructorRequest) -> InstructorProfileOut:
    user = users_repo.get_by_id(user_id)
    if not user:
        raise NotFoundError("Usuário não encontrado")
    if instructors_repo.get_profile_by_user(user_id):
        raise ConflictError("Já existe um perfil de instrutor para este usuário")

    # REQ02: veículo próprio exige CRLV + foto
    if payload.provides_vehicle and not (payload.crlv_url and payload.vehicle_photo_url):
        raise BadRequestError(
            "Para veículo próprio é obrigatório enviar o CRLV e a foto do veículo"
        )

    profile = instructors_repo.insert_profile(
        {
            "user_id": str(user_id),
            "status": "pending",  # REQ02: começa "Em Análise"
            "provides_vehicle": payload.provides_vehicle,
            "cnh_url": payload.cnh_url,
            "credential_url": payload.credential_url,
            "crlv_url": payload.crlv_url,
            "vehicle_photo_url": payload.vehicle_photo_url,
            "teaching_method": payload.teaching_method,
            "price": payload.price,
            "region": payload.region,
        }
    )
    instructors_repo.set_categories(profile["id"], payload.categories)
    # Promove o papel do usuário (re-login emite token de instrutor)
    users_repo.update(user_id, {"role": "instructor"})
    audit.log_event(user_id, "request_instructor", "instructor_profiles", profile["id"])

    return _profile_out(profile, payload.categories)


def _profile_out(profile: dict, categories: list[str] | None = None) -> InstructorProfileOut:
    if categories is None:
        categories = instructors_repo.get_categories(profile["id"])
    user = users_repo.get_by_id(profile["user_id"])
    return InstructorProfileOut(
        id=str(profile["id"]),
        user_id=str(profile["user_id"]),
        full_name=user["full_name"] if user else None,
        status=profile["status"],
        provides_vehicle=profile["provides_vehicle"],
        categories=categories,
        teaching_method=profile.get("teaching_method"),
        price=float(profile["price"]),
        region=profile["region"],
    )


def get_my_profile(user_id: str) -> InstructorProfileOut:
    profile = instructors_repo.get_profile_by_user(user_id)
    if not profile:
        raise NotFoundError("Perfil de instrutor não encontrado")
    return _profile_out(profile)


def update_my_profile(user_id: str, payload: InstructorUpdate) -> InstructorProfileOut:
    profile = instructors_repo.get_profile_by_user(user_id)
    if not profile:
        raise NotFoundError("Perfil de instrutor não encontrado")
    changes = {k: v for k, v in payload.model_dump().items() if v is not None}
    if changes:
        profile = instructors_repo.update_profile(profile["id"], changes)
        audit.log_event(user_id, "update_instructor", "instructor_profiles", profile["id"])
    return _profile_out(profile)


def approve_instructor(admin_user: dict, profile_id: str) -> InstructorProfileOut:
    if admin_user["role"] != "admin":
        raise ForbiddenError("Apenas administradores podem aprovar instrutores")
    profile = instructors_repo.get_profile(profile_id)
    if not profile:
        raise NotFoundError("Perfil de instrutor não encontrado")
    profile = instructors_repo.update_profile(profile_id, {"status": "approved"})
    audit.log_event(admin_user["id"], "approve_instructor", "instructor_profiles", profile_id)
    return _profile_out(profile)


def search(
    category: str | None,
    region: str | None,
    needs_instructor_vehicle: bool | None,
    sort_by: str | None = None,
) -> list[InstructorCard]:
    rows = instructors_repo.search_cards(category, region, needs_instructor_vehicle)
    cards = [_card_from_row(r) for r in rows]
    # Ordenações/filtros secundários (REQ03)
    if sort_by == "rating":
        cards.sort(key=lambda c: (c.avg_rating or 0), reverse=True)
    elif sort_by == "lessons":
        cards.sort(key=lambda c: c.total_lessons, reverse=True)
    return cards


def get_public_profile(instructor_id: str) -> InstructorCard:
    row = instructors_repo.get_card(instructor_id)
    if not row or row.get("status") != "approved":
        raise NotFoundError("Instrutor não encontrado ou não aprovado")
    return _card_from_row(row)
