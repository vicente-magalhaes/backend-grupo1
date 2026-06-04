"""
app/services/booking_service.py

Busca/agenda, solicitação e gestão de aulas (REQ03/REQ04), com:
  • regra dos 8 dias (REQ03)            • visibilidade de endereço (REQ07)
  • pagamento na solicitação (REQ09)    • política de reembolso (REQ03/REQ09)
"""

from app.core import audit
from app.core.errors import BadRequestError, ConflictError, ForbiddenError, NotFoundError
from app.repositories import (
    bookings_repo,
    instructors_repo,
    payments_repo,
    users_repo,
)
from app.schemas.booking import BookingCreate, BookingOut, RefundPolicyOut, RefundWindow, SlotOut
from app.services import policy

_MODALITIES = {"own", "instructor"}
_METHODS = {"credit", "debit", "pix"}


def _notify(user_id: str, ntype: str, message: str) -> None:
    payments_repo.insert_notification(
        {"user_id": str(user_id), "type": ntype, "message": message}
    )


def _booking_out(booking: dict, viewer_role: str = "student") -> BookingOut:
    slot = bookings_repo.get_slot(booking["slot_id"])
    instructor_id = slot["instructor_id"] if slot else None
    start_at = slot["start_at"] if slot else None

    address = booking.get("meeting_address")
    # REQ07: instrutor só vê o endereço exato após a aula confirmada
    if viewer_role == "instructor" and booking["status"] != "confirmed":
        address = None

    return BookingOut(
        id=str(booking["id"]),
        student_id=str(booking["student_id"]),
        slot_id=str(booking["slot_id"]),
        instructor_id=str(instructor_id) if instructor_id else None,
        vehicle_modality=booking["vehicle_modality"],
        status=booking["status"],
        price=float(booking["price"]),
        meeting_address=address,
        start_at=str(start_at) if start_at else None,
        created_at=str(booking.get("created_at")) if booking.get("created_at") else None,
        confirmed_at=str(booking.get("confirmed_at")) if booking.get("confirmed_at") else None,
    )


def list_availability(instructor_id: str) -> list[SlotOut]:
    """Horários livres do instrutor que respeitam a regra dos 8 dias (REQ03)."""
    slots = bookings_repo.list_slots(instructor_id, only_free=True)
    out = []
    for s in slots:
        if policy.is_slot_bookable(policy.parse_dt(s["start_at"])):
            out.append(
                SlotOut(
                    id=str(s["id"]),
                    instructor_id=str(s["instructor_id"]),
                    start_at=str(s["start_at"]),
                    end_at=str(s["end_at"]),
                    status=s["status"],
                )
            )
    return out


def create_booking(student_id: str, payload: BookingCreate) -> BookingOut:
    if payload.vehicle_modality not in _MODALITIES:
        raise BadRequestError("Modalidade de veículo inválida")
    if payload.payment_method not in _METHODS:
        raise BadRequestError("Método de pagamento inválido")

    slot = bookings_repo.get_slot(payload.slot_id)
    if not slot:
        raise NotFoundError("Horário não encontrado")
    if slot["status"] != "free":
        raise ConflictError("Este horário não está mais disponível")
    if not policy.is_slot_bookable(policy.parse_dt(slot["start_at"])):
        raise BadRequestError("A aula deve começar com no mínimo 8 dias de antecedência")

    instructor_profile = instructors_repo.get_profile(slot["instructor_id"])
    if not instructor_profile:
        raise NotFoundError("Instrutor não encontrado")
    student = users_repo.get_by_id(student_id)

    # REQ07: manter o endereço do cadastro ou informar um novo (atualiza o cadastro)
    if payload.keep_registered_address:
        meeting_address = student.get("meeting_address")
    else:
        if not payload.meeting_address:
            raise BadRequestError("Informe o novo endereço do ponto de encontro")
        meeting_address = payload.meeting_address
        users_repo.update(student_id, {"meeting_address": meeting_address})

    booking = bookings_repo.insert_booking(
        {
            "student_id": str(student_id),
            "slot_id": str(payload.slot_id),
            "vehicle_modality": payload.vehicle_modality,
            "status": "awaiting_confirmation",
            "price": float(instructor_profile["price"]),
            "meeting_address": meeting_address,
        }
    )
    bookings_repo.update_slot_status(payload.slot_id, "reserved")

    # REQ09: pagamento confirmado/efetuado já na solicitação
    payments_repo.insert_payment(
        {
            "booking_id": str(booking["id"]),
            "amount": float(instructor_profile["price"]),
            "method": payload.payment_method,
            "status": "paid",
        }
    )
    _notify(
        instructor_profile["user_id"],
        "new_booking",
        "Você recebeu uma nova solicitação de aula.",
    )
    audit.log_event(student_id, "create_booking", "bookings", booking["id"])
    return _booking_out(booking, viewer_role="student")


def _assert_owner_instructor(instructor_user: dict, booking: dict) -> dict:
    slot = bookings_repo.get_slot(booking["slot_id"])
    profile = instructors_repo.get_profile(slot["instructor_id"]) if slot else None
    if not profile or str(profile["user_id"]) != str(instructor_user["id"]):
        raise ForbiddenError("Esta solicitação não pertence a você")
    return profile


def accept_booking(instructor_user: dict, booking_id: str) -> BookingOut:
    booking = bookings_repo.get_booking(booking_id)
    if not booking:
        raise NotFoundError("Solicitação não encontrada")
    _assert_owner_instructor(instructor_user, booking)
    if booking["status"] != "awaiting_confirmation":
        raise ConflictError("Esta solicitação não está mais aguardando confirmação")

    booking = bookings_repo.update_booking(
        booking_id, {"status": "confirmed", "confirmed_at": policy.utcnow().isoformat()}
    )
    _notify(booking["student_id"], "booking_confirmed", "Sua aula foi confirmada!")
    audit.log_event(instructor_user["id"], "accept_booking", "bookings", booking_id)
    return _booking_out(booking, viewer_role="instructor")


def reject_booking(instructor_user: dict, booking_id: str, reason: str) -> BookingOut:
    booking = bookings_repo.get_booking(booking_id)
    if not booking:
        raise NotFoundError("Solicitação não encontrada")
    _assert_owner_instructor(instructor_user, booking)
    if booking["status"] != "awaiting_confirmation":
        raise ConflictError("Esta solicitação não está mais aguardando confirmação")

    booking = bookings_repo.update_booking(booking_id, {"status": "cancelled"})
    bookings_repo.update_slot_status(booking["slot_id"], "free")

    # Instrutor recusou → reembolso integral (REQ04/REQ09)
    payment = payments_repo.get_by_booking(booking_id)
    if payment:
        payments_repo.update_payment(payment["id"], {"status": "refunded"})

    _notify(
        booking["student_id"],
        "booking_rejected",
        f"Sua solicitação foi recusada. Motivo: {reason}. Valor reembolsado.",
    )
    audit.log_event(instructor_user["id"], "reject_booking", "bookings", booking_id)
    return _booking_out(booking, viewer_role="instructor")


def list_student_bookings(student_id: str) -> list[BookingOut]:
    rows = bookings_repo.list_by_student(student_id)
    return [_booking_out(b, viewer_role="student") for b in rows]


def list_instructor_bookings(instructor_user: dict) -> list[BookingOut]:
    profile = instructors_repo.get_profile_by_user(instructor_user["id"])
    if not profile:
        raise NotFoundError("Perfil de instrutor não encontrado")
    rows = bookings_repo.list_by_instructor(profile["id"])
    return [_booking_out(b, viewer_role="instructor") for b in rows]


def refund_policy(booking_id: str) -> RefundPolicyOut:
    booking = bookings_repo.get_booking(booking_id)
    if not booking:
        raise NotFoundError("Solicitação não encontrada")
    slot = bookings_repo.get_slot(booking["slot_id"])
    start = policy.parse_dt(slot["start_at"])
    windows = [
        RefundWindow(label=w["label"], percentage=w["percentage"], until=w["until"].isoformat())
        for w in policy.refund_windows(start)
    ]
    return RefundPolicyOut(lesson_start=start.isoformat(), windows=windows)
