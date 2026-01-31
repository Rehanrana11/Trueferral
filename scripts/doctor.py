#!/usr/bin/env python3
"""
# Updated: 2026-01-30 23:14:00
doctor.py - IntroFlow health check
Verifies environment is ready for development.
"""
# Updated: 2026-01-30 23:14:00
import sys
from pathlib import Path
import os

def fail(msg: str):
    print(f"FAIL: {msg}", file=sys.stderr)
    sys.exit(1)

def main():
    print("=== doctor.py (IntroFlow) ===")
    
    # Detect if running in CI
    is_ci = os.getenv("CI") == "true" or os.getenv("GITHUB_ACTIONS") == "true"
    
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
    
    print("PASS: doctor checks OK")

if __name__ == "__main__":
    main()