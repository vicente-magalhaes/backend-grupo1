"""
app/api/v1/instructors.py — perfil de instrutor (REQ02) e busca (REQ03).
Rotas estáticas declaradas antes de /{instructor_id} para evitar colisão.
"""

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user, require_role
from app.schemas.instructor import (
    InstructorCard,
    InstructorProfileOut,
    InstructorRequest,
    InstructorUpdate,
)
from app.services import instructor_service

router = APIRouter(prefix="/instructors", tags=["Instructors"])


@router.post("/request", response_model=InstructorProfileOut, status_code=201)
def request_instructor(payload: InstructorRequest, user: dict = Depends(get_current_user)):
    return instructor_service.request_instructor(user["id"], payload)


@router.get("/me", response_model=InstructorProfileOut)
def my_profile(user: dict = Depends(require_role("instructor"))):
    return instructor_service.get_my_profile(user["id"])


@router.patch("/me", response_model=InstructorProfileOut)
def update_my_profile(payload: InstructorUpdate, user: dict = Depends(require_role("instructor"))):
    return instructor_service.update_my_profile(user["id"], payload)


@router.get("/search", response_model=list[InstructorCard])
def search(
    category: str | None = None,
    region: str | None = None,
    needs_instructor_vehicle: bool | None = None,
    sort_by: str | None = None,
    user: dict = Depends(get_current_user),
):
    return instructor_service.search(category, region, needs_instructor_vehicle, sort_by)


@router.get("/{instructor_id}", response_model=InstructorCard)
def public_profile(instructor_id: str, user: dict = Depends(get_current_user)):
    return instructor_service.get_public_profile(instructor_id)


@router.post("/{profile_id}/approve", response_model=InstructorProfileOut)
def approve(profile_id: str, user: dict = Depends(require_role("admin"))):
    return instructor_service.approve_instructor(user, profile_id)
