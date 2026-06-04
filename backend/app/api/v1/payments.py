"""
app/api/v1/payments.py — comprovante e cancelamento/reembolso (REQ09).
"""

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user, require_role
from app.schemas.payment import PaymentOut, RefundOut
from app.services import payment_service

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("/{booking_id}/receipt", response_model=PaymentOut)
def receipt(booking_id: str, user: dict = Depends(get_current_user)):
    return payment_service.get_receipt(user, booking_id)


@router.post("/{booking_id}/cancel", response_model=RefundOut)
def cancel(booking_id: str, user: dict = Depends(require_role("student"))):
    return payment_service.cancel_and_refund(user, booking_id)
