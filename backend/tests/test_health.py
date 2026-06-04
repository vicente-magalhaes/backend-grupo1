"""
tests/test_health.py

Teste de fumaça: garante que o app sobe e o health check responde.
Mantém o CI verde mesmo antes dos módulos de negócio existirem.
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "CNH Connect API"
