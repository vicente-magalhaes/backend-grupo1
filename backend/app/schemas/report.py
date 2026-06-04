"""
app/schemas/report.py

Schemas de relatório de aula (REQ08) e dashboard de evolução / IA (REQ05).
"""

from pydantic import BaseModel, field_validator


class ReportCreate(BaseModel):
    booking_id: str
    baliza: int
    percurso: int
    embreagem: int
    observations: str | None = None
    strengths: str | None = None
    weaknesses: str | None = None

    @field_validator("baliza", "percurso", "embreagem")
    @classmethod
    def _validate_score(cls, v: int) -> int:
        if not 0 <= v <= 10:
            raise ValueError("As notas das competências devem estar entre 0 e 10")
        return v


class ReportOut(BaseModel):
    id: str
    booking_id: str
    baliza: int
    percurso: int
    embreagem: int
    observations: str | None = None
    strengths: str | None = None
    weaknesses: str | None = None
    created_at: str | None = None


class DashboardOut(BaseModel):
    """Dashboard de evolução do aluno (REQ05)."""

    media_baliza: float | None = None
    media_percurso: float | None = None
    media_embreagem: float | None = None
    aulas_realizadas: int = 0
    aulas_minimas: int = 20
    aulas_faltantes: int = 20
    probabilidade_aprovacao: float | None = None  # 0..100
    ponto_mais_critico: str | None = None


class InstructorSuggestion(BaseModel):
    """Sugestão da IA heurística (REQ05)."""

    instructor_id: str
    full_name: str
    avg_rating: float | None = None
    motivo: str
