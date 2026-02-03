import json
import os
import subprocess
import sys

def _run_module(args):
    env = os.environ.copy()
    env["PYTHONPATH"] = os.pathsep.join(["src", env.get("PYTHONPATH", "")]).strip(os.pathsep)
    return subprocess.run([sys.executable, "-m", "introflow", *args], capture_output=True, text=True, env=env)

def test_cli_help_exits_zero_and_prints_usage():
    r = _run_module(["--help"])
    assert r.returncode == 0, r.stderr
    out = (r.stdout or "") + (r.stderr or "")
    assert "IntroFlow MVP operator entrypoint" in out

def test_cli_smoke_is_deterministic_json_line():
    r = _run_module(["smoke"])
    assert r.returncode == 0, r.stderr
    line = r.stdout.strip().splitlines()[-1]
    payload = json.loads(line)
    assert payload["receipt_id"] == "eid_smoke_123"
    assert payload["created_at"] == "2026-02-01T00:00:00+00:00"
    assert payload["created_by"] == "smoke_user"

def test_importing_introflow_cli_is_pure():
    before = set(sys.modules.keys())
    mods_to_clear = [k for k in sys.modules if k.startswith("introflow.cli")]
    for mod in mods_to_clear:
        del sys.modules[mod]
    import introflow.cli
    after = set(sys.modules.keys())
    new_imports = after - before
    forbidden = ("sqlalchemy", "alembic", "psycopg", "psycopg2", "introflow.db")
    offenders = [m for m in new_imports if m.startswith(forbidden)]
    assert offenders == [], f"CLI pulled forbidden modules: {offenders}"