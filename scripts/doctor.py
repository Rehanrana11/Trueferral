#!/usr/bin/env python3
"""
doctor.py - IntroFlow health check
Verifies environment is ready for development.
"""
import sys
from pathlib import Path
import os

def fail(msg: str):
    print(f"FAIL: {msg}", file=sys.stderr)
    sys.exit(1)

def main():
    print("=== doctor.py (IntroFlow) ===")

    # Robust CI detection - check multiple indicators
    is_ci = (
        os.getenv("CI", "").lower() in ("true", "1", "yes") or
        os.getenv("GITHUB_ACTIONS", "").lower() in ("true", "1", "yes") or
        os.getenv("CI") == "true" or
        os.getenv("GITHUB_ACTIONS") == "true" or
        bool(os.getenv("GITHUB_WORKFLOW"))  # GitHub Actions always sets this
    )
    
    # Debug: print CI detection result
    print(f"CI detected: {is_ci}")
    if is_ci:
        print("Running in CI environment - skipping .venv check")

    # 1. Check repo root
    root = Path.cwd()
    print(f"Repo root: {root}")

    # 2. Check Python executable
    python_exe = sys.executable
    print(f"Python: {python_exe}")

    # 3. Check .venv exists (skip in CI - uses system Python)
    if not is_ci:
        venv_path = root / ".venv"
        if not venv_path.exists():
            fail(f".venv missing. Run: python -m venv .venv")
    else:
        print("Skipping .venv check (CI environment)")

    # 4. Test imports (Step 34: Config)
    try:
        from introflow.config import Settings, get_settings  # noqa: F401
    except ImportError as e:
        fail(f"introflow.config not importable: {e}")

    # 5. Test imports (Step 35: Logging)
    try:
        from introflow.logging import get_logger, bind_request_id  # noqa: F401
    except ImportError as e:
        fail(f"introflow.logging not importable: {e}")

    # 6. Step 36: Verify error module
    try:
        from introflow import errors  # noqa: F401
        from introflow import AppError, BadRequestError, to_error_response  # noqa: F401
    except ImportError as e:
        fail(f"introflow.errors not importable: {e}")

    # 7. Step 37: Verify FastAPI app + health payload import
    try:
        from introflow.app import app  # noqa: F401
        from introflow.health import health_payload  # noqa: F401
        from introflow.version import __version__  # noqa: F401
    except ImportError as e:
        fail(f"Step 37 imports failed: {e}")

    # 8. Pytest collection test
    import subprocess
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "--collect-only", "-q"],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        fail(f"pytest collection failed:\n{result.stderr}")

        # Step 39: Secrets Management Rail
    def _step_39_secrets_gate() -> None:
        from pathlib import Path
        import subprocess

        root = Path.cwd()
        env_example = root / ".env.example"
        if not env_example.exists():
            fail(".env.example missing")

        raw = env_example.read_text(encoding="utf-8")
        bad = []
        present = set()
        for line in raw.splitlines():
            s = line.strip()
            if not s or s.startswith("#"):
                continue
            if "=" in s:
                k, v = s.split("=", 1)
                k = k.strip()
                if k:
                    present.add(k)
                if v.strip() != "":
                    bad.append(k)

        if bad:
            fail(f".env.example must not contain values. Keys with values: {bad}")

        required = []
        try:
            from introflow.config.settings import Settings
            fields = getattr(Settings, "model_fields", {}) or {}
            for name, f in fields.items():
                try:
                    is_req = bool(getattr(f, "is_required")())
                except Exception:
                    is_req = bool(getattr(f, "required", False))
                if not is_req:
                    continue
                env = None
                va = getattr(f, "validation_alias", None)
                if isinstance(va, str) and va:
                    env = va
                al = getattr(f, "alias", None)
                if isinstance(al, str) and al:
                    env = env or al
                env = env or name.upper()
                required.append(env)
        except Exception:
            required = ["DATABASE_URL", "APP_ENV", "INTROFLOW_LOG_JSON"]

        missing = [k for k in required if k not in present]
        if missing:
            fail(f".env.example missing required keys: {missing}")

        p = subprocess.run(["git", "ls-files"], cwd=str(root), capture_output=True, text=True)
        if p.returncode != 0:
            fail(f"git ls-files failed: {(p.stderr or p.stdout).strip()}")

        tracked = [ln.strip().replace("\\", "/") for ln in (p.stdout or "").splitlines() if ln.strip()]
        offenders = set()

        for f in tracked:
            if f == ".env":
                offenders.add(f)
            if f.startswith(".env.") and f != ".env.example":
                offenders.add(f)

        exts = (".pem", ".key", ".p12", ".pfx", ".crt", ".cer")
        for f in tracked:
            lf = f.lower()
            if lf.endswith(exts):
                offenders.add(f)
            base = Path(f).name.lower()
            if base in ("id_rsa", "id_rsa.pub", "id_ed25519", "id_ed25519.pub"):
                offenders.add(f)

        if offenders:
            fail(f"Secret material tracked by git: {sorted(offenders)}")

        print("PASS: Step 39 secrets rail OK")

    _step_39_secrets_gate()
    print("PASS: doctor checks OK")

if __name__ == "__main__":
    main()