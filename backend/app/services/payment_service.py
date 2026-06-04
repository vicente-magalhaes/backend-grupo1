"""
app/services/payment_service.py

Pagamento simulado (REQ09): comprovante e cancelamento com reembolso conforme
a política de retenção (calculada em runtime, não armazenada — 3FN).
"""

from app.core import audit
from app.core.errors import ConflictError, ForbiddenError, NotFoundError
from app.repositories import bookings_repo, instructors_repo, payments_repo
from app.schemas.payment import PaymentOut, RefundOut
from app.services import policy


def _payment_out(p: dict) -> PaymentOut:
    return PaymentOut(
        id=str(p["id"]),
        booking_id=str(p["booking_id"]),
        amount=float(p["amount"]),
        method=p["method"],
        status=p["status"],
        created_at=str(p.get("created_at")) if p.get("created_at") else None,
    )


def _can_access(user: dict, booking: dict) -> bool:
    if str(booking["student_id"]) == str(user["id"]):
        return True
    slot = bookings_repo.get_slot(booking["slot_id"])
    profile = instructors_repo.get_profile(slot["instructor_id"]) if slot else None
    return bool(profile and str(profile["user_id"]) == str(user["id"]))


def get_receipt(user: dict, booking_id: str) -> PaymentOut:
    """Comprovante: acessível ao aluno e ao instrutor da aula (REQ09)."""
    booking = bookings_repo.get_booking(booking_id)
    if not booking:
        raise NotFoundError("Aula não encontrada")
    if not _can_access(user, booking):
        raise ForbiddenError("Você não tem acesso a este comprovante")
    payment = payments_repo.get_by_booking(booking_id)
    if not payment:
        raise NotFoundError("Pagamento não encontrado")
    return _payment_out(payment)


def cancel_and_refund(student_user: dict, booking_id: str) -> RefundOut:
    booking = bookings_repo.get_booking(booking_id)
    if not booking:
        raise NotFoundError("Aula não encontrada")
    if str(booking["student_id"]) != str(student_user["id"]):
        raise ForbiddenError("Apenas o aluno da aula pode cancelá-la")
    if booking["status"] in ("cancelled", "completed"):
        raise ConflictError("Esta aula não pode mais ser cancelada")

    slot = bookings_repo.get_slot(booking["slot_id"])
    start = policy.parse_dt(slot["start_at"])
    hours = policy.hours_between(start, policy.utcnow())
    pct = policy.refund_percentage(hours)

    payment = payments_repo.get_by_booking(booking_id)
    amount_paid = float(payment["amount"]) if payment else float(booking["price"])
    refund_amount = round(amount_paid * pct / 100, 2)

    if payment:
        payments_repo.update_payment(payment["id"], {"status": "refunded"})
    bookings_repo.update_booking(booking_id, {"status": "cancelled"})
    bookings_repo.update_slot_status(booking["slot_id"], "free")
    payments_repo.insert_notification(
        {
            "user_id": str(booking["student_id"]),
            "type": "booking_cancelled",
            "message": f"Aula cancelada. Reembolso de {pct}% (R$ {refund_amount:.2f}).",
        }
    )
    audit.log_event(student_user["id"], "cancel_refund", "bookings", booking_id)
    return RefundOut(
        booking_id=str(booking_id),
        amount_paid=amount_paid,
        refund_percentage=pct,
        refund_amount=refund_amount,
        status="refunded",
    )
