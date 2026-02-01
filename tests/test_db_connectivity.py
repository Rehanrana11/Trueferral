import pytest

from introflow.db.engine import create_engine_from_settings


def test_create_engine_from_settings_accepts_postgres(monkeypatch):
    # Clear settings cache before test
    from introflow.config.settings import get_settings
    get_settings.cache_clear()
    
    monkeypatch.setenv("INTROFLOW_DATABASE_URL", "postgresql://user:pass@localhost:5432/introflow")
    eng = create_engine_from_settings()
    # Constructing engine should not connect; verify URL backend.
    assert eng.url.get_backend_name() == "postgresql"


def test_create_engine_from_settings_rejects_non_postgres(monkeypatch):
    # Clear settings cache before test
    from introflow.config.settings import get_settings
    get_settings.cache_clear()
    
    monkeypatch.setenv("INTROFLOW_DATABASE_URL", "sqlite:///tmp.db")
    with pytest.raises(ValueError, match="must be Postgres"):
        create_engine_from_settings()