from fastapi.testclient import TestClient

from introflow.app import app
from introflow import health as health_mod

def test_health_ok_has_required_fields(monkeypatch):
    monkeypatch.setattr(health_mod, "check_dependencies", lambda: {"ok": True, "missing": []})
    client = TestClient(app)
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert isinstance(data["version"], str)
    assert data["dependencies"]["ok"] is True
    assert data["dependencies"]["missing"] == []

def test_health_degraded_when_deps_missing(monkeypatch):
    monkeypatch.setattr(health_mod, "check_dependencies", lambda: {"ok": False, "missing": ["structlog"]})
    client = TestClient(app)
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "degraded"
    assert data["dependencies"]["ok"] is False
    assert data["dependencies"]["missing"] == ["structlog"]

def test_version_reads_from_pyproject():
    from introflow.version import __version__
    assert isinstance(__version__, str)
    assert len(__version__) > 0