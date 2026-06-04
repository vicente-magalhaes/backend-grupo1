"""
app/api/v1/bookings.py — agenda, solicitação e gestão de aulas (REQ03/REQ04).
"""

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user, require_role
from app.schemas.booking import (
    BookingCreate,
    BookingOut,
    BookingReject,
    RefundPolicyOut,
    SlotOut,
)
from app.services import booking_service

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("/availability/{instructor_id}", response_model=list[SlotOut])
def availability(instructor_id: str, user: dict = Depends(get_current_user)):
    return booking_service.list_availability(instructor_id)


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(payload: BookingCreate, user: dict = Depends(require_role("student"))):
    return booking_service.create_booking(user["id"], payload)


@router.get("/me/student", response_model=list[BookingOut])
def my_student_bookings(user: dict = Depends(require_role("student"))):
    return booking_service.list_student_bookings(user["id"])


@router.get("/me/instructor", response_model=list[BookingOut])
def my_instructor_bookings(user: dict = Depends(require_role("instructor"))):
    return booking_service.list_instructor_bookings(user)


@router.post("/{booking_id}/accept", response_model=BookingOut)
def accept(booking_id: str, user: dict = Depends(require_role("instructor"))):
    return booking_service.accept_booking(user, booking_id)


@router.post("/{booking_id}/reject", response_model=BookingOut)
def reject(
    booking_id: str,
    payload: BookingReject,
    user: dict = Depends(require_role("instructor")),
):
    return booking_service.reject_booking(user, booking_id, payload.reason)


@router.get("/{booking_id}/refund-policy", response_model=RefundPolicyOut)
def refund_policy(booking_id: str, user: dict = Depends(get_current_user)):
    return booking_service.refund_policy(booking_id)
