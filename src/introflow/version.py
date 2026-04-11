from __future__ import annotations

from pathlib import Path

def _get_version() -> str:
    try:
        import tomllib  # py>=3.11
        pyproject = Path(__file__).resolve().parents[2] / "pyproject.toml"
        with open(pyproject, "rb") as f:
            data = tomllib.load(f)
        return str(data["project"]["version"])
    except Exception:
        return "0.0.0-dev"

__version__ = _get_version()