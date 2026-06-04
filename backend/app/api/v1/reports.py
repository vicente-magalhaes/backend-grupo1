"""
app/api/v1/reports.py — relatório de aula (REQ08), dashboard e IA (REQ05).
"""

from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.schemas.report import DashboardOut, InstructorSuggestion, ReportCreate, ReportOut
from app.services import report_service

router = APIRouter(prefix="/reports", tags=["Reports & IA"])


@router.post("", response_model=ReportOut, status_code=201)
def create_report(payload: ReportCreate, user: dict = Depends(require_role("instructor"))):
    return report_service.create_report(user, payload)


@router.get("/me", response_model=list[ReportOut])
def my_reports(user: dict = Depends(require_role("student"))):
    return report_service.list_student_reports(user["id"])


@router.get("/dashboard", response_model=DashboardOut)
def my_dashboard(user: dict = Depends(require_role("student"))):
    return report_service.student_dashboard(user["id"])


@router.get("/dashboard/{student_id}", response_model=DashboardOut)
def instructor_dashboard(student_id: str, user: dict = Depends(require_role("instructor"))):
    return report_service.instructor_view_dashboard(user, student_id)


@router.get("/suggestions", response_model=list[InstructorSuggestion])
def suggestions(user: dict = Depends(require_role("student"))):
    return report_service.suggest_instructors(user["id"])
