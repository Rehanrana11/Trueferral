from __future__ import annotations

import ast
import subprocess
from pathlib import Path

from fastapi.testclient import TestClient

from introflow.app import app


def _git_ls_files() -> list[str]:
    p = subprocess.run(["git", "ls-files"], capture_output=True, text=True)
    assert p.returncode == 0, (p.stderr or p.stdout)
    return [ln.strip() for ln in (p.stdout or "").splitlines() if ln.strip()]


def test_security_no_high_signal_secrets_in_tracked_files():
    """
    High-signal secret scan (deterministic, tracked files only).
    """
    tracked = _git_ls_files()
    patterns = ["BEGIN PRIVATE KEY", "-----BEGIN", "AWS_SECRET_ACCESS_KEY", "AKIA", "AIza"]
    allowlist_files = {"tests/test_security_sanity.py", "docs/contex_pack/6_release/step_64_incident_playbook_v0.md"}
    offenders = []
    root = Path.cwd()

    for rel in tracked:
        if rel in allowlist_files:
            continue
        path = root / rel
        if not path.exists() or path.is_dir():
            continue
        if path.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip", ".exe"}:
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for pat in patterns:
            if pat in text:
                offenders.append(f"{pat}: {rel}")
                break

    assert offenders == [], "High-signal secret markers found:\n" + "\n".join(offenders)


def test_security_logging_redaction_keys_and_behavior():
    from introflow.logging.logger import REDACT_KEYS, _redact

    required = {"password", "secret", "token", "api_key", "authorization"}
    assert required.issubset(set(k.lower() for k in REDACT_KEYS))

    event = {"password": "p@ss", "token": "tok", "authorization": "Bearer abc", "api_key": "key", "secret": "shh", "ok": "value"}
    out = _redact(None, None, dict(event))
    for k in ["password", "token", "authorization", "api_key", "secret"]:
        assert out[k] == "***REDACTED***"
    assert out["ok"] == "value"


def test_security_auth_adapter_has_no_logging_imports():
    """
    Auth adapter should not import logging to reduce risk of logging subjects/tokens.
    """
    p = Path("src/introflow/auth/api.py")
    src = p.read_text(encoding="utf-8")
    tree = ast.parse(src)

    forbidden_modules = {"structlog", "introflow.logging", "introflow.logging.logger"}
    imported = set()

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imported.add(alias.name)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imported.add(node.module)

    assert forbidden_modules.isdisjoint(imported)


def test_security_unknown_fields_still_rejected_422():
    c = TestClient(app)
    r = c.post("/v1/intro-receipts", json={"counterparty": "Alice", "note": "hi", "hacker_field": "evil"}, headers={"X-IntroFlow-Subject": "user_test"})
    assert r.status_code == 422