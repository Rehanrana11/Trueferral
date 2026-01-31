import sys
import subprocess
from pathlib import Path

def fail(msg: str, code: int = 1) -> None:
    print(f"FAIL: {msg}")
    raise SystemExit(code)

def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    out = (p.stdout or "") + (p.stderr or "")
    return p.returncode, out.strip()

def main() -> int:
    print("=== doctor.py (IntroFlow) ===")
    root = Path(__file__).resolve().parents[1]
    print(f"Repo root: {root}")

    venv = root / ".venv"
    if not venv.exists():
        fail(".venv missing. Run: python -m venv .venv (or scripts/bootstrap.ps1)")

    print(f"Python: {Path(sys.executable)}")

    # Pytest collect must succeed
    code, out = run([sys.executable, "-m", "pytest", "--collect-only", "-q"])
    if code != 0:
        print(out)
        fail("pytest collection failed")

    
    # Step 36: Verify error module
    try:
        from introflow import errors
        from introflow import AppError, BadRequestError, to_error_response
    except ImportError as e:
        fail(f"introflow.errors not importable: {e}")
    
    # Step 37: Verify FastAPI app + health payload import
    try:
        from introflow.app import app  # noqa: F401
        from introflow.health import health_payload  # noqa: F401
        from introflow.version import __version__  # noqa: F401
    except ImportError as e:
        fail(f"Step 37 imports failed: {e}")
    print("PASS: doctor checks OK")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())