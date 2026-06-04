"""
tests/test_schemas.py

Testa as validações de entrada (REQ01/REQ02/REQ08).
"""

import pytest
from pydantic import ValidationError

from app.schemas.auth import StudentRegister
from app.schemas.instructor import InstructorRequest
from app.schemas.report import ReportCreate


def _student(**overrides):
    base = {
        "full_name": "Fulano de Tal",
        "email": "fulano@email.com",
        "phone": "11999990000",
        "cpf": "123.456.789-01",
        "password": "senha123",
        "meeting_address": "Rua X, 1",
    }
    base.update(overrides)
    return base


def test_student_register_normaliza_cpf_e_email():
    s = StudentRegister(**_student())
    assert s.cpf == "12345678901"  # pontuação removida
    assert s.email == "fulano@email.com"


def test_student_register_rejeita_cpf_invalido():
    with pytest.raises(ValidationError):
        StudentRegister(**_student(cpf="123"))


def test_student_register_rejeita_email_invalido():
    with pytest.raises(ValidationError):
        StudentRegister(**_student(email="naoeumemail"))


def test_student_register_exige_senha_minima():
    with pytest.raises(ValidationError):
        StudentRegister(**_student(password="123"))


def test_instructor_categorias_invalidas():
    with pytest.raises(ValidationError):
        InstructorRequest(
            categories=["C"], cnh_url="a", credential_url="b", price=100, region="X"
        )


def test_instructor_normaliza_categorias():
    req = InstructorRequest(
        categories=["b", "a", "a"], cnh_url="a", credential_url="b", price=100, region="X"
    )
    assert req.categories == ["A", "B"]


def test_instructor_preco_positivo():
    with pytest.raises(ValidationError):
        InstructorRequest(
            categories=["A"], cnh_url="a", credential_url="b", price=0, region="X"
        )


def test_report_score_fora_do_intervalo():
    with pytest.raises(ValidationError):
        ReportCreate(booking_id="x", baliza=11, percurso=5, embreagem=5)
