import os
import sys
import pytest
from pydantic import ValidationError

# Make src importable without packaging assumptions
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "src")
if SRC not in sys.path:
    sys.path.insert(0, SRC)

from introflow.config.settings import Settings


def test_missing_required_database_url_fails(monkeypatch):
    monkeypatch.delenv("INTROFLOW_DATABASE_URL", raising=False)
    with pytest.raises(ValidationError):
        Settings()


def test_valid_database_url_passes(monkeypatch):
    monkeypatch.setenv("INTROFLOW_DATABASE_URL", "postgresql://user:pass@localhost:5432/introflow")
    s = Settings()
    assert str(s.database_url).startswith("postgresql://")


def test_invalid_app_env_fails(monkeypatch):
    monkeypatch.setenv("INTROFLOW_DATABASE_URL", "postgresql://user:pass@localhost:5432/introflow")
    monkeypatch.setenv("INTROFLOW_APP_ENV", "staging")  # not allowed
    with pytest.raises(ValidationError):
        Settings()


def test_log_json_parses_bool(monkeypatch):
    monkeypatch.setenv("INTROFLOW_DATABASE_URL", "postgresql://user:pass@localhost:5432/introflow")
    monkeypatch.setenv("INTROFLOW_LOG_JSON", "true")
    s = Settings()
    assert s.log_json is True