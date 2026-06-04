"""
app/services/report_service.py

Relatório de aula (REQ08) e dashboard de evolução + IA heurística (REQ05).
"""

from app.core import audit
from app.core.errors import ConflictError, ForbiddenError, NotFoundError
from app.repositories import bookings_repo, instructors_repo, reports_repo
from app.schemas.report import DashboardOut, InstructorSuggestion, ReportCreate, ReportOut
from app.services import policy

_COMPETENCY_LABELS = {
    "baliza": "Baliza",
    "percurso": "Percurso",
    "embreagem": "Controle de embreagem",
}


def _report_out(r: dict) -> ReportOut:
    return ReportOut(
        id=str(r["id"]),
        booking_id=str(r["booking_id"]),
        baliza=r["baliza"],
        percurso=r["percurso"],
        embreagem=r["embreagem"],
        observations=r.get("observations"),
        strengths=r.get("strengths"),
        weaknesses=r.get("weaknesses"),
        created_at=str(r.get("created_at")) if r.get("created_at") else None,
    )


def create_report(instructor_user: dict, payload: ReportCreate) -> ReportOut:
    booking = bookings_repo.get_booking(payload.booking_id)
    if not booking:
        raise NotFoundError("Aula não encontrada")

    slot = bookings_repo.get_slot(booking["slot_id"])
    profile = instructors_repo.get_profile(slot["instructor_id"]) if slot else None
    if not profile or str(profile["user_id"]) != str(instructor_user["id"]):
        raise ForbiddenError("Esta aula não pertence a você")
    if booking["status"] not in ("confirmed", "completed"):
        raise ConflictError("Só é possível avaliar aulas confirmadas")
    if reports_repo.get_by_booking(payload.booking_id):
        raise ConflictError("Esta aula já possui um relatório")

    report = reports_repo.insert_report(
        {
            "booking_id": str(payload.booking_id),
            "baliza": payload.baliza,
            "percurso": payload.percurso,
            "embreagem": payload.embreagem,
            "observations": payload.observations,
            "strengths": payload.strengths,
            "weaknesses": payload.weaknesses,
        }
    )
    bookings_repo.update_booking(payload.booking_id, {"status": "completed"})
    audit.log_event(instructor_user["id"], "create_report", "lesson_reports", report["id"])
    return _report_out(report)


def _student_reports(student_id: str) -> list[dict]:
    bookings = bookings_repo.list_by_student(student_id)
    booking_ids = [b["id"] for b in bookings]
    return reports_repo.list_by_bookings(booking_ids)


def list_student_reports(student_id: str) -> list[ReportOut]:
    return [_report_out(r) for r in _student_reports(student_id)]


def student_dashboard(student_id: str) -> DashboardOut:
    reports = _student_reports(student_id)
    n = len(reports)
    if n == 0:
        return DashboardOut(
            aulas_realizadas=0,
            aulas_faltantes=policy.MIN_LESSONS_REQUIRED,
        )

    mb = round(sum(r["baliza"] for r in reports) / n, 1)
    mp = round(sum(r["percurso"] for r in reports) / n, 1)
    me = round(sum(r["embreagem"] for r in reports) / n, 1)
    averages = {"baliza": mb, "percurso": mp, "embreagem": me}
    weakest_key = min(averages, key=averages.get)

    return DashboardOut(
        media_baliza=mb,
        media_percurso=mp,
        media_embreagem=me,
        aulas_realizadas=n,
        aulas_minimas=policy.MIN_LESSONS_REQUIRED,
        aulas_faltantes=max(policy.MIN_LESSONS_REQUIRED - n, 0),
        probabilidade_aprovacao=policy.approval_probability(mb, mp, me),
        ponto_mais_critico=_COMPETENCY_LABELS[weakest_key],
    )


def instructor_view_dashboard(instructor_user: dict, student_id: str) -> DashboardOut:
    """REQ05: instrutor vê o dashboard só de alunos com quem tem aula confirmada."""
    profile = instructors_repo.get_profile_by_user(instructor_user["id"])
    if not profile:
        raise NotFoundError("Perfil de instrutor não encontrado")
    rows = bookings_repo.list_by_instructor(profile["id"])
    has_relation = any(
        str(b["student_id"]) == str(student_id)
        and b["status"] in ("confirmed", "completed")
        for b in rows
    )
    if not has_relation:
        raise ForbiddenError("Você não tem aulas confirmadas com este aluno")
    return student_dashboard(student_id)


def suggest_instructors(student_id: str) -> list[InstructorSuggestion]:
    """IA heurística (REQ05): destaca instrutores melhor avaliados, citando o ponto crítico."""
    dash = student_dashboard(student_id)
    critico = dash.ponto_mais_critico or "habilidades gerais"
    cards = instructors_repo.search_cards()
    cards.sort(key=lambda c: (c.get("avg_rating") or 0), reverse=True)
    suggestions = []
    for c in cards[:3]:
        suggestions.append(
            InstructorSuggestion(
                instructor_id=str(c["instructor_id"]),
                full_name=c["full_name"],
                avg_rating=float(c["avg_rating"]) if c.get("avg_rating") is not None else None,
                motivo=f"Bem avaliado para reforçar seu ponto mais crítico: {critico}.",
            )
        )
    return suggestions
