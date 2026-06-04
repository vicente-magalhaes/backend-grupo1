"""
app/api/v1/chat.py — chat por aula (REQ06) e avaliação 5 estrelas (REQ06).
"""

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.schemas.chat import MessageCreate, MessageOut, RatingCreate, RatingOut
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/{booking_id}/messages", response_model=list[MessageOut])
def list_messages(booking_id: str, user: dict = Depends(get_current_user)):
    return chat_service.list_messages(user, booking_id)


@router.post("/{booking_id}/messages", response_model=MessageOut, status_code=201)
def send_message(booking_id: str, payload: MessageCreate, user: dict = Depends(get_current_user)):
    return chat_service.send_message(user, booking_id, payload)


@router.post("/{booking_id}/rate", response_model=RatingOut, status_code=201)
def rate(booking_id: str, payload: RatingCreate, user: dict = Depends(get_current_user)):
    return chat_service.rate(user, booking_id, payload)
