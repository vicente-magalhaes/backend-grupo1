"""
app/schemas/chat.py

Schemas de chat (REQ06) e avaliação 5 estrelas liberada no chat (REQ06).
"""

from pydantic import BaseModel, field_validator


class MessageCreate(BaseModel):
    content: str
    msg_type: str = "text"  # 'text' | 'location'

    @field_validator("msg_type")
    @classmethod
    def _validate_type(cls, v: str) -> str:
        if v not in {"text", "location"}:
            raise ValueError("msg_type deve ser 'text' ou 'location'")
        return v


class MessageOut(BaseModel):
    id: str
    booking_id: str
    sender_id: str
    content: str
    msg_type: str
    created_at: str | None = None


class RatingCreate(BaseModel):
    stars: int

    @field_validator("stars")
    @classmethod
    def _validate_stars(cls, v: int) -> int:
        if not 0 <= v <= 5:
            raise ValueError("A avaliação deve ser de 0 a 5 estrelas")
        return v


class RatingOut(BaseModel):
    id: str
    booking_id: str
    rater_role: str
    stars: int
