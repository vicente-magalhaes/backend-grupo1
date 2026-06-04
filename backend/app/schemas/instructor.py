"""
app/schemas/instructor.py

Schemas do perfil de instrutor (REQ02) e do card de busca (REQ03).
"""

from pydantic import BaseModel, field_validator

_VALID_CATEGORIES = {"A", "B"}


class InstructorRequest(BaseModel):
    """Solicitação de habilitação como instrutor (REQ02)."""

    categories: list[str]
    provides_vehicle: bool = False
    cnh_url: str
    credential_url: str
    crlv_url: str | None = None
    vehicle_photo_url: str | None = None
    teaching_method: str | None = None
    price: float
    region: str

    @field_validator("categories")
    @classmethod
    def _validate_categories(cls, v: list[str]) -> list[str]:
        v = [c.strip().upper() for c in v]
        if not v:
            raise ValueError("Selecione ao menos uma categoria (A e/ou B)")
        invalid = set(v) - _VALID_CATEGORIES
        if invalid:
            raise ValueError(f"Categorias inválidas: {invalid}. Use apenas A e/ou B")
        return sorted(set(v))

    @field_validator("price")
    @classmethod
    def _validate_price(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("O preço deve ser maior que zero")
        return v


class InstructorUpdate(BaseModel):
    teaching_method: str | None = None
    price: float | None = None
    region: str | None = None


class InstructorProfileOut(BaseModel):
    id: str
    user_id: str
    full_name: str | None = None
    status: str
    provides_vehicle: bool
    categories: list[str] = []
    teaching_method: str | None = None
    price: float
    region: str


class InstructorCard(BaseModel):
    """Resumo exibido na lista de resultados da busca (REQ03)."""

    instructor_id: str
    full_name: str
    region: str
    price: float
    provides_vehicle: bool
    categories: list[str] = []
    avg_rating: float | None = None
    total_lessons: int = 0
    photo_url: str | None = None  # placeholder no frontend
