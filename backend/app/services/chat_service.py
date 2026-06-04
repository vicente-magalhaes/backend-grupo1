"""
app/services/chat_service.py

Chat por aula (REQ06) e avaliação 5 estrelas mútua liberada após a aula (REQ06).
Localização só é compartilhável após a confirmação (REQ07).
"""

from app.core import audit
from app.core.errors import ConflictError, ForbiddenError, NotFoundError
from app.repositories import bookings_repo, chat_repo, instructors_repo
from app.schemas.chat import MessageCreate, MessageOut, RatingCreate, RatingOut


def _participants(booking: dict) -> tuple[str, str | None]:
    slot = bookings_repo.get_slot(booking["slot_id"])
    profile = instructors_repo.get_profile(slot["instructor_id"]) if slot else None
    instructor_user_id = str(profile["user_id"]) if profile else None
    return str(booking["student_id"]), instructor_user_id


def _assert_participant(user: dict, booking: dict) -> str:
    student_id, instructor_user_id = _participants(booking)
    if str(user["id"]) == student_id:
        return "student"
    if instructor_user_id and str(user["id"]) == instructor_user_id:
        return "instructor"
    raise ForbiddenError("Você não participa desta conversa")


def _msg_out(m: dict) -> MessageOut:
    return MessageOut(
        id=str(m["id"]),
        booking_id=str(m["booking_id"]),
        sender_id=str(m["sender_id"]),
        content=m["content"],
        msg_type=m["msg_type"],
        created_at=str(m.get("created_at")) if m.get("created_at") else None,
    )


def list_messages(user: dict, booking_id: str) -> list[MessageOut]:
    booking = bookings_repo.get_booking(booking_id)
    if not booking:
        raise NotFoundError("Conversa não encontrada")
    _assert_participant(user, booking)
    return [_msg_out(m) for m in chat_repo.list_messages(booking_id)]


def send_message(user: dict, booking_id: str, payload: MessageCreate) -> MessageOut:
    booking = bookings_repo.get_booking(booking_id)
    if not booking:
        raise NotFoundError("Conversa não encontrada")
    _assert_participant(user, booking)  # chat já habilitado pois a solicitação existe (REQ06)

    # REQ07: localização só após a aula confirmada
    if payload.msg_type == "location" and booking["status"] != "confirmed":
        raise ConflictError(
            "A localização só pode ser compartilhada após a confirmação da aula"
        )

    msg = chat_repo.insert_message(
        {
            "booking_id": str(booking_id),
            "sender_id": str(user["id"]),
            "content": payload.content,
            "msg_type": payload.msg_type,
        }
    )
    audit.log_event(user["id"], "send_message", "chat_messages", msg["id"])
    return _msg_out(msg)


def rate(user: dict, booking_id: str, payload: RatingCreate) -> RatingOut:
    booking = bookings_repo.get_booking(booking_id)
    if not booking:
        raise NotFoundError("Aula não encontrada")
    role = _assert_participant(user, booking)
    if booking["status"] not in ("confirmed", "completed"):
        raise ConflictError("A avaliação é liberada após a aula")
    if chat_repo.get_rating(booking_id, role):
        raise ConflictError("Você já avaliou esta aula")

    rating = chat_repo.insert_rating(
        {"booking_id": str(booking_id), "rater_role": role, "stars": payload.stars}
    )
    audit.log_event(user["id"], "rate", "ratings", rating["id"])
    return RatingOut(
        id=str(rating["id"]),
        booking_id=str(rating["booking_id"]),
        rater_role=rating["rater_role"],
        stars=rating["stars"],
    )
