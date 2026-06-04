"""
app/schemas/booking.py

Schemas de agenda, solicitação de aula e política de reembolso (REQ03/REQ04/REQ09).
"""

from pydantic import BaseModel


class SlotOut(BaseModel):
    id: str
    instructor_id: str
    start_at: str
    end_at: str
    status: str


class BookingCreate(BaseModel):
    """Solicitação de aula. O pagamento é confirmado junto (REQ04+REQ09)."""

    slot_id: str
    vehicle_modality: str  # 'own' | 'instructor'
    payment_method: str  # 'credit' | 'debit' | 'pix'
    keep_registered_address: bool = True
    meeting_address: str | None = None  # usado se keep_registered_address=False (REQ07)


class BookingReject(BaseModel):
    reason: str


class BookingOut(BaseModel):
    id: str
    student_id: str
    slot_id: str
    instructor_id: str | None = None
    vehicle_modality: str
    status: str
    price: float
    meeting_address: str | None = None  # revelado conforme regra do REQ07
    start_at: str | None = None
    created_at: str | None = None
    confirmed_at: str | None = None


class RefundWindow(BaseModel):
    label: str
    percentage: int
    until: str | None = None


class RefundPolicyOut(BaseModel):
    """Janelas de reembolso contextualizadas (REQ03/REQ09)."""

    lesson_start: str
    windows: list[RefundWindow]
