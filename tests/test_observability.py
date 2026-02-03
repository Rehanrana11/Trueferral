import sys

from fastapi.testclient import TestClient

from introflow.app import app
from introflow.observability.ids import reset_correlation_id_provider, set_correlation_id_provider


class FakeCorrelationProvider:
    def new(self) -> str:
        return "cid_generated_test_123"


def test_correlation_id_echoes_back_when_provided():
    c = TestClient(app)
    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": "Mike", "note": "hi"},
        headers={"X-IntroFlow-Subject": "user_abc", "X-Correlation-Id": "cid_test_1234"},
    )
    assert r.status_code == 200, r.text
    assert r.headers.get("X-Correlation-Id") == "cid_test_1234"
    assert "X-Request-Duration-Ms" in r.headers


def test_correlation_id_generated_when_missing_is_deterministic():
    set_correlation_id_provider(FakeCorrelationProvider())
    try:
        c = TestClient(app)
        r = c.post(
            "/v1/intro-receipts",
            json={"counterparty": "Mike", "note": None},
            headers={"X-IntroFlow-Subject": "user_abc"},
        )
        assert r.status_code == 200, r.text
        assert r.headers.get("X-Correlation-Id") == "cid_generated_test_123"
    finally:
        reset_correlation_id_provider()


def test_duration_header_present_and_numeric():
    c = TestClient(app)
    r = c.post(
        "/v1/intro-receipts",
        json={"counterparty": "Mike", "note": "hi"},
        headers={"X-IntroFlow-Subject": "user_abc"},
    )
    assert r.status_code == 200, r.text
    v = r.headers.get("X-Request-Duration-Ms")
    assert v is not None
    ms = int(v)
    assert ms >= 0


def test_observability_import_is_pure():
    before = set(sys.modules.keys())

    mods_to_clear = [k for k in sys.modules if k.startswith("introflow.observability")]
    for mod in mods_to_clear:
        del sys.modules[mod]

    import introflow.observability  # noqa: F401

    after = set(sys.modules.keys())
    new_imports = after - before

    forbidden = ("sqlalchemy", "alembic", "psycopg", "psycopg2", "introflow.db")
    offenders = [m for m in new_imports if m.startswith(forbidden)]
    assert offenders == [], f"observability pulled forbidden modules: {offenders}"