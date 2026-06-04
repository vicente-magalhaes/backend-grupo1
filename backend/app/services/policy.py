"""
app/services/policy.py

Regras de negócio PURAS (sem banco, sem FastAPI) — fáceis de testar com pytest.
Concentra a política de reembolso (REQ03/REQ09), a regra dos 8 dias (REQ03) e o
cálculo de probabilidade de aprovação (REQ05).
"""

import datetime as dt

MIN_LESSON_LEAD_HOURS = 192  # 8 dias — aulas só podem ser solicitadas com esta antecedência (REQ03)
MIN_LESSONS_REQUIRED = 20  # nº mínimo de aulas antes da prova prática (parametrizável)


def utcnow() -> dt.datetime:
    return dt.datetime.now(dt.UTC)


def parse_dt(value: str | dt.datetime) -> dt.datetime:
    """Converte ISO string (Supabase) em datetime tz-aware."""
    if isinstance(value, dt.datetime):
        return value
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))


def hours_between(later: dt.datetime, earlier: dt.datetime) -> float:
    return (later - earlier).total_seconds() / 3600.0


def is_slot_bookable(start_at: dt.datetime, now: dt.datetime | None = None) -> bool:
    """REQ03: só aparecem/são solicitáveis aulas com início >= 192h (8 dias)."""
    now = now or utcnow()
    return hours_between(start_at, now) >= MIN_LESSON_LEAD_HOURS


def refund_percentage(hours_before_start: float) -> int:
    """Política de retenção acumulada (REQ03 — tabela atualizada)."""
    if hours_before_start > 336:  # > 14 dias
        return 100
    if hours_before_start >= 168:  # 7 a 14 dias
        return 80
    if hours_before_start >= 24:  # 1 a 7 dias
        return 60
    return 40  # < 24h


def refund_windows(lesson_start: dt.datetime) -> list[dict]:
    """Janelas de reembolso contextualizadas para exibir ao aluno (REQ03)."""
    return [
        {"label": "100% de reembolso", "percentage": 100,
         "until": lesson_start - dt.timedelta(hours=336)},
        {"label": "80% de reembolso", "percentage": 80,
         "until": lesson_start - dt.timedelta(hours=168)},
        {"label": "60% de reembolso", "percentage": 60,
         "until": lesson_start - dt.timedelta(hours=24)},
        {"label": "40% de reembolso", "percentage": 40, "until": lesson_start},
    ]


def approval_probability(
    media_baliza: float | None, media_percurso: float | None, media_embreagem: float | None
) -> float | None:
    """Heurística (REQ05): média das competências (0..10) projetada para 0..100%."""
    vals = [v for v in (media_baliza, media_percurso, media_embreagem) if v is not None]
    if not vals:
        return None
    return round(sum(vals) / len(vals) * 10, 1)
