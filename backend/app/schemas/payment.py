"""
app/schemas/payment.py

Schemas de pagamento simulado (REQ09).
"""

from pydantic import BaseModel


class PaymentOut(BaseModel):
    id: str
    booking_id: str
    amount: float
    method: str
    status: str  # 'pending' | 'paid' | 'refunded'
    created_at: str | None = None


class RefundOut(BaseModel):
    booking_id: str
    amount_paid: float
    refund_percentage: int
    refund_amount: float
    status: str
